import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';

import type { CapturedOutput, ExitCode, ToolAction } from './types.ts';

import Output from './Output.ts';
import { getExitCodeForSignal } from './processes.ts';

interface Options {
  readonly verbose: boolean;
  readonly debug: boolean;
  readonly help: boolean;
  readonly cache: boolean;
  readonly cacheDir: string;
  readonly ignorePatterns?: readonly string[];
  readonly staged: boolean;
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
    const { exitCode } = await this.spawnSubprocess(command, args, env, false);
    return exitCode;
  }

  /**
   * @returns The command's output.
   * @throws {Error} If the command could not be run.
   */
  public async captureSubprocess(
    command: string,
    args: readonly string[],
    env: Readonly<Record<string, string>> = {},
  ): Promise<CapturedOutput> {
    return this.spawnSubprocess(command, args, env, true);
  }

  private async spawnSubprocess(
    command: string,
    args: readonly string[],
    env: Readonly<Record<string, string>>,
    captureStdout: boolean,
  ): Promise<CapturedOutput> {
    this.output.verbose('Running command:', [command, ...args]);

    const proc = spawn(command, args, {
      cwd: this.directory,
      env: { ...process.env, ...env },
      stdio: ['inherit', captureStdout ? 'pipe' : 'inherit', 'inherit'],
    });

    let stdout = '';
    if (proc.stdout != null) {
      proc.stdout.setEncoding('utf8').on('data', (chunk: string) => {
        stdout += chunk;
      });
    }

    return new Promise<CapturedOutput>((resolve, reject) => {
      const end = (exitCode: ExitCode): void => {
        resolve({ exitCode, stdout });
      };

      proc.on('error', (error) => {
        reject(new Error(`Failed to run "${command}": ${error.message}`, { cause: error }));
      });
      proc.on('close', (code, signal) => {
        if (code != null) {
          end(code);
          return;
        }
        if (signal == null) {
          end(EXIT_CODE_UNKNOWN_ERROR);
          return;
        }
        end(getExitCodeForSignal(signal));
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
        // Environment
        dir: { type: 'string', short: 'd', default: process.cwd() },
        'cache-dir': { type: 'string', default: '.cache' },
        'no-cache': { type: 'boolean', default: false },

        // Scope
        tool: { type: 'string', short: 't', default: undefined },
        ignore: { type: 'string', multiple: true },
        staged: { type: 'boolean', default: false },

        // Output
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

    if (options.staged && paths.length > 0) {
      cli.output.error('Cannot combine --staged with specific paths.');
    }

    return {
      cli,
      selectedAction: selectedAction as ToolAction, // Validated above
      selectedTool: tool,
    };
  }
}
