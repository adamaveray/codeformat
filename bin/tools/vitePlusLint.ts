import type { Tool } from '../utils/types.ts';

import runners from '../utils/runners.ts';

export default {
  exec: runners.viteplus.cmd,
  command: 'lint',
  actions: () => ({
    check: [],
    fix: ['--fix'],
  }),
  args: {
    debug: ['--format', 'default'],
  },
  configFiles: ['vite.config.ts'],
} satisfies Tool;
