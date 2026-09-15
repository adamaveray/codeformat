import type { Tool } from '../utils/types.ts';

import runners from '../utils/runners.ts';

const commonArgs = ['--recursive', '--parallel'];
export default {
  exec: runners.system,
  command: 'swift-format',
  actions: ({ configPath }) => ({
    check: ['lint', ...commonArgs, '--strict', '--configuration', configPath, '.'],
    fix: ['format', ...commonArgs, '--in-place', '--configuration', configPath, '.'],
  }),
  args: {},
  configFiles: ['.swift-format'],
} satisfies Tool;
