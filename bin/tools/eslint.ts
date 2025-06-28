import { commonExts, withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import type { Tool } from '../utils/types.ts';

export default {
  exec: runners.bun,
  command: 'eslint',
  actions: (configPath) => ({
    check: ['--config', configPath, '.'],
    fix: ['--fix', '--config', configPath, '.'],
  }),
  args: {
    debug: ['-vvv'],
    cache: (cacheDir) => ['--cache', '--cache-location', cacheDir],
  },
  configFiles: withExts('eslint.config', [...commonExts.js, ...commonExts.ts]),
} satisfies Tool;
