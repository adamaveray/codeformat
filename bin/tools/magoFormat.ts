import type { Tool } from '../utils/types.ts';

import runners from '../utils/runners.ts';

export default {
  exec: runners.composer,
  command: 'mago',
  actions: () => ({
    check: ['format', '--check'],
    fix: ['format'],
  }),
  args: {},
  configFiles: ['mago.toml', 'mago.yaml', 'mago.json'],
} satisfies Tool;
