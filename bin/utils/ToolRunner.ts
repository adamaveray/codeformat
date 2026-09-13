import path from 'node:path';

import type Cli from './Cli.ts';
import type { Tool, ToolAction, ToolActionContext } from './types.ts';

import { findFirstFile } from './filesystem.ts';

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
      return this.runTool(toolName as TToolName, tool, action);
    }

    // Run all tools
    for (const [thisToolName, thisTool] of Object.entries(this.tools) as [TToolName, Tool][]) {
      await this.runTool(thisToolName, thisTool, action);
    }
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

  private async runTool(toolName: TToolName, tool: Tool, action: ToolAction): Promise<void> {
    const { command, exec, actions, args: additionalArgs = {}, env, configFiles } = tool;

    const configPath = this.loadConfigPath(toolName, configFiles);
    if (configPath == null) {
      return;
    }

    const context: ToolActionContext = {
      configPath,
      supportedExtensions: tool.perFile === false ? [] : tool.supportedExtensions,
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
}
