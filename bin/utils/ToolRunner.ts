import path from 'node:path';
import process from 'node:process';

import type Cli from './Cli.ts';
import type { ExitCode, FileExtension, NamedTool, Tool, ToolAction, ToolActionContext } from './types.ts';

import ExecutionBatcher from './ExecutionBatcher.ts';
import { findFirstFile } from './filesystem.ts';
import { createIgnoreFilters, defaultIgnorePatterns, resolveIgnoreSource } from './ignores.ts';
import { createFileExtensionFilter, FileError, pathEqualsDirectory, resolvePaths } from './paths.ts';
import { EXIT_CODE_OK, getMostSevereExitCode } from './processes.ts';

type ArgsBuilder = (context?: Partial<ToolActionContext>) => readonly string[] | undefined;
type ToolExecutor<T = Tool> = (args: readonly string[], buildArgs: ArgsBuilder, tool: Tool & T) => Promise<ExitCode>;

const maximumBatchArguments = 4_000;
const argumentBytesBuffer = 1_000; // The number of bytes to reserve for additional command-specific arguments.

export default class ToolRunner<TToolName extends string> {
  constructor(
    private readonly cli: Cli,
    private readonly tools: Record<TToolName, Tool>,
  ) {}

  public async run(action: ToolAction, toolName?: string): Promise<ExitCode> {
    // Run single tool
    if (toolName != null) {
      const tool = (this.tools as Record<string, Tool>)[toolName];
      if (tool == null) {
        this.cli.output.error(`Unknown tool "${toolName}".`);
      }
      return this.runTool(toolName as TToolName, tool, action, this.resolveGivenPaths());
    }

    // Run all tools
    const givenPaths = this.resolveGivenPaths();
    for (const [thisToolName, thisTool] of Object.entries(this.tools) as [TToolName, Tool][]) {
      const exitCode = await this.runTool(thisToolName, thisTool, action, givenPaths);
      if (exitCode !== EXIT_CODE_OK) {
        // Tool failed - abort
        return exitCode;
      }
    }
    return EXIT_CODE_OK;
  }

  /**
   * @returns The files to process, or `undefined` if no paths were given.
   */
  private resolveGivenPaths(): readonly string[] | undefined {
    if (this.cli.paths.length === 0) {
      return undefined; // Each tool covers the whole project itself
    }

    const ignorePatterns =
      this.cli.options.ignorePatterns ?? resolveIgnoreSource(this.cli.directory)?.patterns ?? defaultIgnorePatterns;

    let files: readonly string[];
    let emptyPaths: readonly string[];
    try {
      ({ files, emptyPaths } = resolvePaths(this.cli.paths, {
        rootPath: this.cli.directory,
        ignoreFilters: createIgnoreFilters(ignorePatterns),
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
    return files;
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

  private async runTool(
    toolName: TToolName,
    tool: Tool,
    action: ToolAction,
    givenPaths: readonly string[] | undefined,
  ): Promise<ExitCode> {
    const exec = async (args: readonly string[]) => tool.exec(this.cli, { command: tool.command, args, env: tool.env });

    const configPath = this.loadConfigPath(toolName, tool.configFiles);
    if (configPath == null) {
      return EXIT_CODE_OK;
    }

    return this.executeTool({ name: toolName, ...tool }, action, configPath, {
      // Global tool
      global: async (args) => {
        if (!this.isWholeProject()) {
          // Specific paths provided - skip tool
          this.cli.output.info(`Skipping tool "${toolName}": global tool not applicable to specific files.`);
          return EXIT_CODE_OK;
        }

        return exec(args);
      },

      // Per-file tool
      perFile: async (commonArgs, buildArgs, { supportedExtensions }) => {
        if (givenPaths == null) {
          // Run project-wide
          return exec(commonArgs);
        }

        const paths = ToolRunner.filterFilesByExtensions(givenPaths, supportedExtensions);
        if (paths == null) {
          // Skip tool
          this.cli.output.debug(`Skipping tool "${toolName}": no supported files given.`);
          return EXIT_CODE_OK;
        }

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
            this.cli.output.info(`Running tool "${toolName}" (${batchInfo(index, totalBatches)}).`);
          }

          const batchExitCode = await exec(batchArgs);
          if (batchExitCode !== EXIT_CODE_OK) {
            if (totalBatches > 1) {
              this.cli.output.warn(`Tool "${toolName}" failed (${batchInfo(index, totalBatches)}).`);
            }
            exitCode = getMostSevereExitCode(exitCode, batchExitCode);
          }
        }
        return exitCode;
      },
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

  /**
   * @returns Whether a given path encompasses the entire project.
   */
  private isWholeProject(): boolean {
    const { directory: projectDirectory, paths } = this.cli;
    if (paths.length === 0) {
      // Defaults to project
      return true;
    }

    // One path must match project directory
    return paths.some((pathName) => pathEqualsDirectory(pathName, projectDirectory));
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
