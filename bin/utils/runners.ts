import type { ToolExec } from './types.ts';

export default {
  viteplus: {
    async cmd(this: void, cli, { command, args, env = {} }) {
      return cli.runSubprocess('vp', [command, ...args], env);
    },
    async exec(this: void, cli, { command, args, env = {} }) {
      return cli.runSubprocess('vp', ['exec', command, ...args], env);
    },
  },
  async node(this: void, cli, { command, args, env = {} }) {
    return cli.runSubprocess(`node_modules/.bin/${command}`, args, env);
  },
  async composer(this: void, cli, { command, args, env = {} }) {
    return cli.runSubprocess('composer', ['exec', command, '--', ...args], env);
  },
  async system(this: void, cli, { command, args, env = {} }) {
    return cli.runSubprocess(command, args, env);
  },
} as const satisfies Record<string, ToolExec | Record<string, ToolExec>>;
