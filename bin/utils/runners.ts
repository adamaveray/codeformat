import type { ToolExec } from './types.ts';

export default {
  async bun(cli, { command, args, env = {} }) {
    return cli.runSubprocess(['bun', '--bun', 'x', command, ...args], env);
  },
  async composer(cli, { command, args, env = {} }) {
    return cli.runSubprocess(['composer', 'exec', command, '--', ...args], env);
  },
} satisfies Record<string, ToolExec>;
