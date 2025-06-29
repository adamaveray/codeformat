import type Cli from './Cli.ts';

// Must be exported as `tsc` fails with "Default export of the module has or is using private name" error if not
export interface Command {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export type ToolExec = (cli: Cli, command: Command) => Promise<void>;

export type ToolAction = 'check' | 'fix';

export interface Tool {
  exec: ToolExec;
  command: string;
  actions: (configPath: string) => Partial<Record<ToolAction, string[]>>;
  args?: Partial<{
    debug: string[];
    cache: (cacheDir: string) => string[];
  }>;
  env?: Command['env'];
  configFiles: string[];
}
