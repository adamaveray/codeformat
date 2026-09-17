import path from 'node:path';
import process from 'node:process';

import type Cli from './Cli.ts';
import type { StagedFiles } from './git.ts';
import type { IgnoreFilters } from './ignores.ts';
import type { ExitCode, FileExtension, NamedTool, ScopeFile, Tool, ToolAction, ToolActionContext } from './types.ts';

import ExecutionBatcher from './ExecutionBatcher.ts';
import { findFirstFile } from './filesystem.ts';
import GeneratedFiles from './GeneratedFiles.ts';
import { getStagedFiles, GitError } from './git.ts';
import { createIgnoreFilters, defaultIgnorePatterns, resolveIgnoreSource } from './ignores.ts';
import { createFileExtensionFilter, FileError, pathEqualsDirectory, resolvePaths } from './paths.ts';
import { EXIT_CODE_OK, getMostSevereExitCode } from './processes.ts';

type ArgsBuilder = (context?: Partial<ToolActionContext>) => readonly string[] | undefined;
type ToolExecutor<T = Tool> = (args: readonly string[], buildArgs: ArgsBuilder, tool: Tool & T) => Promise<ExitCode>;

type ToolScope =
  | {
      readonly isWholeProject: true;
      readonly paths?: undefined;
    }
  | {
      readonly isWholeProject: false;
      readonly paths: readonly string[];
    };

const maximumBatchArguments = 4_000;
const argumentBytesBuffer = 1_000; // The number of bytes to reserve for additional command-specific arguments.

export default class ToolRunner<TToolName extends string> {
  /** Files generated during execution. */
  private readonly generatedFiles: GeneratedFiles;

  constructor(
    private readonly cli: Cli,
    private readonly tools: Record<TToolName, Tool>,
  ) {
    this.generatedFiles = new GeneratedFiles(cli.directory, cli.output);
  }

  public async run(action: ToolAction, toolName?: string): Promise<ExitCode> {
    try {
      return await this.runTools(action, toolName);
    } finally {
      this.generatedFiles.cleanUp();
    }
  }

  private async runTools(action: ToolAction, toolName?: string): Promise<ExitCode> {
    const selectedTool = toolName == null ? undefined : (this.tools as Record<string, Tool>)[toolName];
    if (toolName != null && selectedTool == null) {
      this.cli.output.error(`Unknown tool "${toolName}".`);
    }

    const scope = this.resolveToolScope();
    if (scope == null) {
      // Nothing to process
      return EXIT_CODE_OK;
    }

    // Run single tool
    if (selectedTool != null) {
      return this.runTool({ ...selectedTool, name: toolName as TToolName }, action, scope);
    }

    // Run all tools
    for (const [thisToolName, thisTool] of Object.entries(this.tools) as [TToolName, Tool][]) {
      const exitCode = await this.runTool({ ...thisTool, name: thisToolName }, action, scope);
      if (exitCode !== EXIT_CODE_OK) {
        // Tool failed - abort
        return exitCode;
      }
    }
    return EXIT_CODE_OK;
  }

  /**
   * @returns The scope to process, or `undefined` if there is nothing to process at all.
   */
  private resolveToolScope(): ToolScope | undefined {
    if (!this.cli.options.staged && this.cli.paths.length === 0) {
      return { isWholeProject: true };
    }

    const ignorePatterns =
      this.cli.options.ignorePatterns ?? resolveIgnoreSource(this.cli.directory)?.patterns ?? defaultIgnorePatterns;
    const ignoreFilters = createIgnoreFilters(ignorePatterns);

    const givenPaths = this.cli.options.staged ? this.resolveStagedPaths(ignoreFilters) : this.cli.paths;
    if (givenPaths == null) {
      // No scope to apply tool to
      return undefined;
    }

    if (givenPaths.some((pathName) => pathEqualsDirectory(pathName, this.cli.directory))) {
      // A given path covers the project, so there is no need to enumerate its files
      return { isWholeProject: true };
    }

    let resolvedPaths: readonly string[];
    let emptyPaths: readonly string[];
    try {
      ({ files: resolvedPaths, emptyPaths } = resolvePaths(givenPaths, {
        rootPath: this.cli.directory,
        ignoreFilters,
      }));
    } catch (error) {
      if (error instanceof FileError) {
        this.cli.output.error(error.message);
      }
      throw error;
    }

    if (emptyPaths.length > 0) {
      this.cli.output.warn('No files found for given paths:', emptyPaths);
    }
    return {
      isWholeProject: false,
      paths: resolvedPaths,
    };
  }

  /**
   * @param ignoreFilters The filters determining which staged files to omit.
   * @returns The staged files to process, or `undefined` if none remain.
   */
  private resolveStagedPaths(ignoreFilters: IgnoreFilters): readonly string[] | undefined {
    let staged: StagedFiles;
    try {
      staged = getStagedFiles(this.cli.directory);
    } catch (error) {
      if (error instanceof GitError) {
        this.cli.output.error(error.message);
      }
      throw error;
    }

    if (staged.missingPaths.length > 0) {
      this.cli.output.warn('Skipping staged files no longer present:', staged.missingPaths);
    }

    // Apply ignore filters to autopopulated staged files
    const paths = staged.files.filter((filePath) => !ignoreFilters.file(filePath));
    if (paths.length === 0) {
      this.cli.output.info('No staged files found.');
      return undefined;
    }

    this.cli.output.verbose('Staged files:', [paths]);
    return paths;
  }

  private loadConfigPath(toolName: TToolName, configFiles: readonly string[]): string | undefined {
    const filePath = findFirstFile(this.cli.directory, configFiles);
    if (filePath == null) {
      this.cli.output.debug(`Could not find config file for tool "${toolName}".`);
      return undefined;
    }

    this.cli.output.debug('Found config file:', [filePath]);
    return filePath;
  }

  private async runTool(tool: NamedTool<TToolName>, action: ToolAction, scope: ToolScope): Promise<ExitCode> {
    const exec = async (args: readonly string[]) =>
      tool.runner.exec(this.cli, { command: tool.command, args, env: tool.env });

    const configPath = this.loadConfigPath(tool.name, tool.configFiles);
    if (configPath == null) {
      return EXIT_CODE_OK;
    }

    return this.executeTool(tool, action, configPath, {
      // Global tool
      global: async (args) => {
        if (!scope.isWholeProject) {
          // Specific paths provided - skip tool
          this.cli.output.info(`Skipping tool "${tool.name}": global tool not applicable to specific files.`);
          return EXIT_CODE_OK;
        }

        return exec(args);
      },

      // Per-file tool
      perFile: async (commonArgs, buildArgs, { supportedExtensions }) => {
        if (scope.isWholeProject) {
          // Run project-wide
          return exec(commonArgs);
        }

        const paths = ToolRunner.filterFilesByExtensions(scope.paths, supportedExtensions);
        if (paths == null) {
          // Skip tool
          this.cli.output.debug(`Skipping tool "${tool.name}": no supported files given.`);
          return EXIT_CODE_OK;
        }

        if (tool.scopeFile != null) {
          // Narrow the tool via a generated file
          const scopeFilePath = await this.createScopeFile(tool, tool.scopeFile, configPath, paths);
          const args = buildArgs({ scopeFilePath });
          if (args == null) {
            return EXIT_CODE_OK;
          }
          return exec(args);
        }

        // Run the tool in batches
        const batcher = ExecutionBatcher.createForPlatform(
          process.platform,
          [tool.command, ...commonArgs],
          { ...process.env, ...tool.env },
          maximumBatchArguments,
          argumentBytesBuffer,
        );
        const batches = batcher.batch(paths, (batchPaths) => buildArgs({ paths: batchPaths }));

        const batchInfo = (index: number, total: number): string => `batch ${index + 1}/${total}`;
        let exitCode: ExitCode = EXIT_CODE_OK;
        for (const { index, values: batchArgs, totalBatches } of batches) {
          if (totalBatches > 1) {
            this.cli.output.info(`Running tool "${tool.name}" (${batchInfo(index, totalBatches)}).`);
          }

          const batchExitCode = await exec(batchArgs);
          if (batchExitCode !== EXIT_CODE_OK) {
            if (totalBatches > 1) {
              this.cli.output.warn(`Tool "${tool.name}" failed (${batchInfo(index, totalBatches)}).`);
            }
            exitCode = getMostSevereExitCode(exitCode, batchExitCode);
          }
        }
        return exitCode;
      },
    });
  }

  /**
   * @returns The path the tool must be given to restrict itself to the given paths.
   */
  private async createScopeFile(
    { command, env, name, runner }: NamedTool<TToolName>,
    scopeFile: ScopeFile,
    configPath: string,
    paths: readonly string[],
  ): Promise<string> {
    // Use the same ID for tools producing identical contents
    const id = [scopeFile.id, ...paths].join('\0');
    return this.generatedFiles.create(id, scopeFile.location, async () => {
      const { contents, unexpressiblePaths = [] } = await scopeFile.build(paths, {
        configPath,
        output: this.cli.output,
        capture: async (args) => runner.capture(this.cli, { command, args, env }),
      });

      if (unexpressiblePaths.length > 0) {
        this.cli.output.warn(`Skipping paths tool "${name}" cannot be restricted to:`, [unexpressiblePaths]);
      }
      return contents;
    });
  }

  private async executeTool(
    tool: NamedTool,
    action: ToolAction,
    configPath: string,
    executors: {
      global: ToolExecutor<{ perFile: false }>;
      perFile: ToolExecutor<{ perFile?: true }>;
    },
  ): Promise<ExitCode> {
    let executor: ToolExecutor;
    let supportedExtensions: ToolActionContext['supportedExtensions'];

    if (tool.perFile === false) {
      executor = executors.global;
      supportedExtensions = [];
    } else {
      executor = executors.perFile;
      supportedExtensions = tool.supportedExtensions;
    }

    const buildArgs: ArgsBuilder = (extraContext) =>
      this.buildArgs(tool, action, {
        configPath,
        supportedExtensions,
        ...extraContext,
      });

    const args = buildArgs();
    if (args == null) {
      // No command to run
      return EXIT_CODE_OK;
    }

    return executor(args, buildArgs, tool);
  }

  private buildArgs(
    { actions, args: additionalArgs = {}, name: toolName }: NamedTool,
    action: ToolAction,
    context: ToolActionContext,
  ): readonly string[] | undefined {
    const actionArgs = actions(context)[action];
    if (actionArgs == null) {
      return undefined;
    }

    const args: string[] = [...actionArgs];
    if (this.cli.options.debug) {
      args.push(...(additionalArgs.debug ?? []));
    }
    if (this.cli.options.cache) {
      const toolCacheDir = path.join(this.cli.options.cacheDir, toolName);
      args.push(...(additionalArgs.cache?.(toolCacheDir) ?? []));
    }
    return args;
  }

  private static filterFilesByExtensions(
    pathNames: readonly string[],
    supportedExtensions: readonly FileExtension[],
  ): readonly string[] | undefined {
    const isSupportedFile = createFileExtensionFilter(supportedExtensions);
    const paths = pathNames.filter((filePath) => isSupportedFile(filePath));
    return paths.length === 0 ? undefined : paths;
  }
}
