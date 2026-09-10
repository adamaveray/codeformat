import type { Tool } from '../utils/types.ts';

import runners from '../utils/runners.ts';

export default {
  exec: runners.viteplus.cmd,
  command: 'fmt',
  actions: () => ({
    check: ['--check'],
    fix: [],
  }),
  args: {},
  configFiles: ['vite.config.ts'],
} satisfies Tool;
