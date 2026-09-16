import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';

import type { ExitCode, ToolAction } from './types.ts';

import Output from './Output.ts';
import { getExitCodeForSignal } from './processes.ts';

interface Options {
  readonly verbose: boolean;
  readonly debug: boolean;
  readonly help: boolean;
  readonly cache: boolean;
  readonly cacheDir: string;
  readonly ignorePatterns?: readonly string[];
}

const EXIT_CODE_UNKNOWN_ERROR: ExitCode = 1;

export default class Cli {
  public readonly output: Output;

  constructor(
    scriptName: string,
    public readonly directory: string,
    public readonly options: Options,
    public readonly paths: readonly string[] = [],
  ) {
    this.output = new Output(scriptName, options);
  }

  /**
   * @returns The command's exit code.
   * @throws {Error} If the command could not be run at all.
   */
  public async runSubprocess(
    command: string,
    args: readonly string[],
    env: Readonly<Record<string, string>> = {},
  ): Promise<ExitCode> {
    this.output.verbose('Running command:', [command, ...args]);

    const proc = spawn(command, args, {
      cwd: this.directory,
      env: { ...process.env, ...env },
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    return new Promise<ExitCode>((resolve, reject) => {
      proc.on('error', (error) => {
        reject(new Error(`Failed to run "${command}": ${error.message}`, { cause: error }));
      });
      proc.on('close', (code, signal) => {
        if (code != null) {
          resolve(code);
          return;
        }
        if (signal == null) {
          resolve(EXIT_CODE_UNKNOWN_ERROR);
          return;
        }
        resolve(getExitCodeForSignal(signal));
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
        ignore: { type: 'string', multiple: true },

        'no-cache': { type: 'boolean', default: false },
        'cache-dir': { type: 'string', default: '.cache' },
        verbose: { type: 'boolean', default: false },
        debug: { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
      },
      strict: true,
      allowPositionals: true,
    });

    const {
      dir,
      tool,
      'cache-dir': cacheDir,
      'no-cache': noCache,
      ignore: ignorePatterns,
      ...additionalOptions
    } = options;
    const [, scriptName, selectedAction, ...paths] = positionals as [string, string, ...string[]];

    const cli = new Cli(
      scriptName,
      dir,
      {
        cacheDir,
        cache: !noCache,
        ignorePatterns,
        ...additionalOptions,
      },
      paths,
    );
    if (options.help || selectedAction == null) {
      cli.output.usage();
    }

    if (!(['check', 'fix'] satisfies ToolAction[] as unknown[]).includes(selectedAction)) {
      cli.output.error(`Unknown action "${selectedAction}".`);
    }

    return {
      cli,
      selectedAction: selectedAction as ToolAction, // Validated above
      selectedTool: tool,
    };
  }
}
