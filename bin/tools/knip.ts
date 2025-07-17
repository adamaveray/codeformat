import { commonExts, withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import type { Tool } from '../utils/types.ts';

const commonArgs = ['--treat-config-hints-as-errors', '--isolate-workspaces'];
export default {
  exec: runners.bun,
  command: 'knip',
  actions: (configPath) => ({
    check: ['--config', configPath, ...commonArgs],
    fix: ['--fix', '--config', configPath, ...commonArgs],
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
