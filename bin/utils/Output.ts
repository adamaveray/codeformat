export default class Output {
  constructor(
    private readonly scriptName: string,
    private readonly options: Readonly<Record<'debug' | 'verbose', boolean>>,
  ) {}

  public usage(exitCode: number = 0): never {
    console.error(
      `
Usage:
    ${this.scriptName} check [paths...]
    ${this.scriptName} fix [paths...]

Options:
    -d, --dir <path>      The project directory to operate on.
    -t, --tool <name>     Run only the named tool.
        --ignore <glob>   Ignore patterns, replacing any ignore file. Repeatable.
        --no-cache        Disable tool caches.
        --cache-dir <dir> The directory tools write caches to.
        --verbose         Print each command as it is run.
        --debug           Pass debugging flags through to tools.
        --help            Show this message.
`.trim(),
    );
    process.exit(exitCode);
  }

  public info(message: string, additionalValues: readonly unknown[] = []): void {
    console.info(message, ...additionalValues);
  }

  public debug(message: string, additionalValues: readonly unknown[] = []): void {
    if (this.options.debug) {
      console.debug(message, ...additionalValues);
    }
  }

  public verbose(message: string, additionalValues: readonly unknown[] = []): void {
    if (this.options.verbose) {
      console.debug(message, ...additionalValues);
    }
  }

  public warn(message: string, additionalValues: readonly unknown[] = []): void {
    console.warn(message, ...additionalValues);
  }

  public error(message: string, additionalValues: readonly unknown[] = [], exitCode: number = 1): never {
    console.error(message, ...additionalValues);
    process.exit(exitCode);
  }
}
