import type { Command, Runner } from './types.ts';

/** Maps a tool's command & arguments onto the executable actually invoked. */
type CommandBuilder = (command: Command) => Pick<Command, 'command' | 'args'>;

function makeRunner(build: CommandBuilder): Runner {
  return {
    async exec(this: void, cli, toolCommand) {
      const { command, args } = build(toolCommand);
      return cli.runSubprocess(command, args, toolCommand.env ?? {});
    },
  };
}

export default {
  viteplus: {
    cmd: makeRunner(({ command, args }) => ({
      command: 'vp',
      args: [command, ...args],
    })),
    exec: makeRunner(({ command, args }) => ({
      command: 'vp',
      args: ['exec', command, ...args],
    })),
  },
  composer: makeRunner(({ command, args }) => ({
    command: 'composer',
    args: ['exec', command, '--', ...args],
  })),
  system: makeRunner(({ command, args }) => ({
    command,
    args,
  })),
} as const satisfies Record<string, Runner | Record<string, Runner>>;
