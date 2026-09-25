import path from 'node:path';

import type { Tool } from '../utils/types.ts';

import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';

export default {
  runner: runners.composer,
  command: 'php-cs-fixer',
  actions: ({ configPath }) => ({
    check: ['check', '--config', configPath, '-vv'],
    fix: ['fix', '--config', configPath, '-vv'],
  }),
  args: {
    debug: ['-vvv'],
    cache: (cacheDir) => ['--cache-file', path.join(cacheDir, '.php-cs-fixer.cache')],
  },
  configFiles: withExts('.php-cs-fixer', ['php', 'dist.php']),
  perFile: false,
} satisfies Tool;
