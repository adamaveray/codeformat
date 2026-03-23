import type { Tool } from '../utils/types.ts';

import runners from '../utils/runners.ts';

export default {
  exec: runners.bun,
  command: 'oxfmt',
  actions: (configPath) => ({
    check: ['--check', '-c', configPath, '.'],
    fix: ['-c', configPath, '.'],
  }),
  args: {},
  configFiles: ['.oxfmtrc.json', '.oxfmtrc.jsonc'],
} satisfies Tool;
