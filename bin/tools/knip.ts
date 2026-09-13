import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';

const commonArgs = ['--treat-config-hints-as-errors'];
export default {
  exec: runners.viteplus.exec,
  command: 'knip',
  actions: ({ configPath }) => ({
    check: ['--config', configPath, ...commonArgs],
    fix: ['--fix', '--config', configPath, ...commonArgs],
  }),
  args: {
    debug: ['--debug'],
    cache: (cacheDir) => ['--cache', '--cache-location', cacheDir],
  },
  configFiles: [
    ...withExts('knip', ['json', 'jsonc', ...extensions.js, ...extensions.ts]),
    ...withExts('.knip', ['json', 'jsonc']),
    ...withExts('knip.config', [...extensions.js, ...extensions.ts]),
  ],
  perFile: false,
} satisfies Tool;
