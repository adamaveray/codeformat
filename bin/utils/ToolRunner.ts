import path from 'node:path';

import type Cli from './Cli.ts';
import type { FileExtension, Tool, ToolAction, ToolActionContext } from './types.ts';

import { findFirstFile } from './filesystem.ts';
import { createIgnoreFilters, defaultIgnorePatterns, resolveIgnoreSource } from './ignores.ts';
import { createFileExtensionFilter, FileError, pathEqualsDirectory, resolvePaths } from './paths.ts';

export default class ToolRunner<TToolName extends string> {
  constructor(
    private readonly cli: Cli,
    private readonly tools: Record<TToolName, Tool>,
  ) {}

  public async run(action: ToolAction, toolName?: string): Promise<void> {
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
      await this.runTool(thisToolName, thisTool, action, givenPaths);
    }
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
  ): Promise<void> {
    const { command, exec, actions, args: additionalArgs = {}, env, configFiles } = tool;

    const configPath = this.loadConfigPath(toolName, configFiles);
    if (configPath == null) {
      return;
    }

    let supportedExtensions: readonly FileExtension[];
    let paths: readonly string[] | undefined;
    if (tool.perFile === false) {
      // Global tool
      supportedExtensions = [];
      paths = undefined;

      if (!this.isWholeProject()) {
        // Specific paths provided - skip tool
        this.cli.output.info(`Skipping tool "${toolName}": global tool not applicable to specific files.`);
        return;
      }
    } else {
      // Per-file tool
      supportedExtensions = tool.supportedExtensions;

      if (givenPaths != null) {
        const filteredGivenPaths = ToolRunner.filterFilesByExtensions(givenPaths, supportedExtensions);
        if (filteredGivenPaths == null) {
          // Skip tool
          this.cli.output.debug(`Skipping tool "${toolName}": no supported files given.`);
          return;
        }
        paths = filteredGivenPaths;
      }
    }

    const context: ToolActionContext = {
      configPath,
      supportedExtensions,
      paths,
    };
    const actionArgs = actions(context)[action];
    if (actionArgs == null) {
      return;
    }

    const args = [...actionArgs];
    if (this.cli.options.debug) {
      args.push(...(additionalArgs.debug ?? []));
    }
    if (this.cli.options.cache) {
      const toolCacheDir = path.join(this.cli.options.cacheDir, toolName);
      args.push(...(additionalArgs.cache?.(toolCacheDir) ?? []));
    }
    await exec(this.cli, { command, args, env });
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
