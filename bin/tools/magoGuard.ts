import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import runners from '../utils/runners.ts';

export default {
  exec: runners.composer,
  command: 'mago',
  actions: () => ({
    check: ['guard'],
    fix: ['guard', '--fix'],
  }),
  args: {},
  configFiles: ['mago.toml', 'mago.yaml', 'mago.json'],
  supportedExtensions: extensions.php,
} satisfies Tool;
