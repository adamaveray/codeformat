import type { Tool } from '../utils/types.ts';

import runners from '../utils/runners.ts';

export default {
  exec: runners.composer,
  command: 'mago',
  actions: () => ({
    check: ['lint'],
    fix: ['lint', '--fix'],
  }),
  args: {},
  configFiles: ['mago.toml', 'mago.yaml', 'mago.json'],
} satisfies Tool;
