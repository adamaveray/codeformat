import type Cli from './Cli.ts';
import type { GeneratedFileLocation } from './GeneratedFiles.ts';
import type Output from './Output.ts';

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

export interface CapturedOutput {
  readonly exitCode: ExitCode;
  readonly stdout: string;
}

export type ToolExec = (cli: Cli, command: Command) => Promise<ExitCode>;
export type ToolCapture = (cli: Cli, command: Command) => Promise<CapturedOutput>;

export interface Runner {
  /** Runs the command, letting its output through to the user. */
  readonly exec: ToolExec;
  /** Runs the command, collecting its standard output instead of displaying it. */
  readonly capture: ToolCapture;
}

export type ToolAction = 'check' | 'fix';

export interface ScopeFileContext {
  /** The tool’s own configuration file. */
  readonly configPath: string;
  /** Runs the tool’s own command, collecting its standard output. */
  readonly capture: (args: readonly string[]) => Promise<CapturedOutput>;
  readonly output: Output;
}

export interface ScopeFileContents {
  readonly contents: string;
  /** The paths the contents cannot express. */
  readonly unexpressiblePaths?: readonly string[];
}

/** A file instructing a tool which paths to process. */
export interface ScopeFile {
  readonly id: string;
  readonly location: GeneratedFileLocation;
  /** @returns Contents restricting the tool to the given root-relative paths. */
  readonly build: (
    paths: readonly string[],
    context: ScopeFileContext,
  ) => ScopeFileContents | Promise<ScopeFileContents>;
}

export interface ToolActionContext {
  readonly configPath: string;
  readonly supportedExtensions: readonly FileExtension[];
  readonly paths?: readonly string[];
  readonly scopeFilePath?: string;
}

export type Tool = {
  readonly runner: Runner;
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
      readonly scopeFile?: ScopeFile;
    }
  | {
      /** The tool operates on a project, not per-file. */
      readonly perFile: false;
      readonly supportedExtensions?: undefined;
      readonly scopeFile?: undefined;
    }
);

export type NamedTool<TName extends string = string> = Tool & { name: TName };
