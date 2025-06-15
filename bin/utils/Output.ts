export default class Output {
  constructor(
    private readonly scriptName: string,
    private readonly options: Record<'debug' | 'verbose', boolean>,
  ) {}

  public usage(exitCode: number = 0): never {
    console.error(`Usage:
    ${this.scriptName} check [root-path]
    ${this.scriptName} fix [root-path]`);
    process.exit(exitCode);
  }

  public debug(message: string, additionalValues: unknown[] = []): void {
    if (this.options.debug) {
      console.debug(message, ...additionalValues);
    }
  }

  public verbose(message: string, additionalValues: unknown[] = []): void {
    if (this.options.verbose) {
      console.debug(message, ...additionalValues);
    }
  }

  public error(message: string, additionalValues: unknown[] = [], exitCode: number = 1): never {
    console.error(message, ...additionalValues);
    process.exit(exitCode);
  }
}
