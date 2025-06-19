import { parseArgs } from 'node:util';

import { spawn } from 'bun';

import Output from './Output.ts';
import type { ToolAction } from './types.ts';

interface Options {
  verbose: boolean;
  debug: boolean;
  help: boolean;
  cache: boolean;
  cacheDir: string;
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

  public async runSubprocess(args: string[], env: Record<string, string> = {}): Promise<void> {
    this.output.verbose('Running command:', args);

    const proc = spawn(args, {
      env: { ...process.env, ...env },
      cwd: this.directory,
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      process.exit(exitCode);
    }
  }

  public static createFromArgs(argv: string[]): { cli: Cli; selectedAction: ToolAction; selectedTool?: string } {
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

    const cli = new Cli(scriptName, dir, { cacheDir, cache: !noCache, ...additionalOptions });
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
