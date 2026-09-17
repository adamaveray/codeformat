import type Cli from './Cli.ts';

export type NonEmptyArray<T> = [T, ...T[]];

/** A file extension without a leading dot. */
export type FileExtension = Lowercase<string>;

// Must be exported as `tsc` fails with "Default export of the module has or is using private name" error if not
export interface Command {
  readonly command: string;
  readonly args: readonly string[];
  readonly env?: Readonly<Record<string, string>>;
}

export type ExitCode = number;
export type ToolExec = (cli: Cli, command: Command) => Promise<ExitCode>;

export type ToolAction = 'check' | 'fix';

export interface ToolActionContext {
  readonly configPath: string;
  readonly supportedExtensions: readonly FileExtension[];
  readonly paths?: readonly string[];
}

export type Tool = {
  readonly exec: ToolExec;
  readonly command: string;
  readonly actions: (context: ToolActionContext) => Partial<Record<ToolAction, readonly string[]>>;
  readonly args?: Partial<{
    readonly debug: readonly string[];
    readonly cache: (cacheDir: string) => readonly string[];
  }>;
  readonly env?: Command['env'];
  readonly configFiles: readonly string[];
} & (
  | {
      /** The tool operates on individual files. */
      readonly perFile?: true;
      readonly supportedExtensions: readonly FileExtension[];
    }
  | {
      /** The tool operates on a project, not per-file. */
      readonly perFile: false;
      readonly supportedExtensions?: undefined;
    }
);

export type NamedTool = Tool & { name: string };
