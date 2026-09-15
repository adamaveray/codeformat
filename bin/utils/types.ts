import type Cli from './Cli.ts';

// Must be exported as `tsc` fails with "Default export of the module has or is using private name" error if not
export interface Command {
  readonly command: string;
  readonly args: readonly string[];
  readonly env?: Readonly<Record<string, string>>;
}

export type ToolExec = (cli: Cli, command: Command) => Promise<void>;

export type ToolAction = 'check' | 'fix';

export interface ToolActionContext {
  readonly configPath: string;
}

export interface Tool {
  readonly exec: ToolExec;
  readonly command: string;
  readonly actions: (context: ToolActionContext) => Partial<Record<ToolAction, readonly string[]>>;
  readonly args?: Partial<{
    readonly debug: readonly string[];
    readonly cache: (cacheDir: string) => readonly string[];
  }>;
  readonly env?: Command['env'];
  readonly configFiles: readonly string[];
}
