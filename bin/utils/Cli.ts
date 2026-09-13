import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';

import type { ToolAction } from './types.ts';

import Output from './Output.ts';

interface Options {
  readonly verbose: boolean;
  readonly debug: boolean;
  readonly help: boolean;
  readonly cache: boolean;
  readonly cacheDir: string;
}

export default class Cli {
  public readonly output: Output;

  constructor(
    scriptName: string,
    public readonly directory: string,
    public readonly options: Options,
  ) {
    this.output = new Output(scriptName, options);
  }

  public async runSubprocess(
    command: string,
    args: readonly string[],
    env: Readonly<Record<string, string>> = {},
  ): Promise<void> {
    this.output.verbose('Running command:', [command, ...args]);

    const proc = spawn(command, args, {
      cwd: this.directory,
      env: { ...process.env, ...env },
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    await new Promise<void>((resolve) => {
      proc.on('error', (error) => {
        this.output.error(`Failed to run "${command}":`, [error instanceof Error ? error.message : error]);
      });
      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          process.exit(code);
        }
      });
    });
  }

  public static createFromArgs(argv: readonly string[]): {
    cli: Cli;
    selectedAction: ToolAction;
    selectedTool?: string;
  } {
    // Parse input
    const { values: options, positionals } = parseArgs({
      args: argv,
      options: {
        dir: { type: 'string', short: 'd', default: process.cwd() },
        tool: { type: 'string', short: 't', default: undefined },

        'no-cache': { type: 'boolean', default: false },
        'cache-dir': { type: 'string', default: '.cache' },
        verbose: { type: 'boolean', default: false },
        debug: { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
      },
      strict: true,
      allowPositionals: true,
    });

    const { dir, tool, 'cache-dir': cacheDir, 'no-cache': noCache, ...additionalOptions } = options;
    const [, scriptName, selectedAction, ...undefinedArgs] = positionals as [string, string, ...string[]];

    const cli = new Cli(scriptName, dir, {
      cacheDir,
      cache: !noCache,
      ...additionalOptions,
    });
    if (options.help || selectedAction == null) {
      cli.output.usage();
    }

    if (undefinedArgs.length > 0) {
      cli.output.error('Unexpected additional arguments.', [undefinedArgs]);
    }
    if (!(['check', 'fix'] satisfies ToolAction[] as unknown[]).includes(selectedAction)) {
      cli.output.error(`Unknown action "${selectedAction}".`, [undefinedArgs]);
    }

    return {
      cli,
      selectedAction: selectedAction as ToolAction, // Validated above
      selectedTool: tool,
    };
  }
}
