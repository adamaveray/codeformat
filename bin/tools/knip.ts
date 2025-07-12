import { commonExts, withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import type { Tool } from '../utils/types.ts';

export default {
  exec: runners.bun,
  command: 'knip',
  actions: (configPath) => ({
    check: ['--strict', '--config', configPath],
    fix: ['--fix', '--strict', '--config', configPath],
  }),
  args: {
    debug: ['--debug'],
    cache: (cacheDir) => ['--cache', '--cache-location', cacheDir],
  },
  configFiles: [
    ...withExts('knip', ['json', 'jsonc', ...commonExts.js, ...commonExts.ts]),
    ...withExts('.knip', ['json', 'jsonc']),
    ...withExts('knip.config', [...commonExts.js, ...commonExts.ts]),
  ],
} satisfies Tool;
