import type { Tool } from '../utils/types.ts';

import runners from '../utils/runners.ts';

export default {
  exec: runners.bun,
  command: 'oxlint',
  actions: (configPath) => ({
    check: ['--type-check', '--config', configPath, '.'],
    fix: ['--fix', '--type-check', '--config', configPath, '.'],
  }),
  args: {
    debug: ['--format', 'default'],
  },
  configFiles: ['oxlint.config.ts', '.oxlintrc.json'],
} satisfies Tool;
