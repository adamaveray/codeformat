import type { Tool } from '../utils/types.ts';

import runners from '../utils/runners.ts';

const commonArgs = ['--recursive', '--parallel'];
export default {
  exec: runners.system,
  command: 'swift-format',
  actions: ({ configPath, paths = ['.'] }) => ({
    check: ['lint', ...commonArgs, '--strict', '--configuration', configPath, ...paths],
    fix: ['format', ...commonArgs, '--in-place', '--configuration', configPath, ...paths],
  }),
  args: {},
  configFiles: ['.swift-format'],
  supportedExtensions: ['swift'],
} satisfies Tool;
