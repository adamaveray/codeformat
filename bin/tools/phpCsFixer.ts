import path from 'node:path';

import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import { scopeFile } from './utils/phpCsFixer.ts';

export default {
  runner: runners.composer,
  command: 'php-cs-fixer',
  actions: ({ configPath, scopeFilePath }) => {
    const config = scopeFilePath ?? configPath;
    return {
      check: ['check', '--config', config, '-vv'],
      fix: ['fix', '--config', config, '-vv'],
    };
  },
  args: {
    debug: ['-vvv'],
    cache: (cacheDir) => ['--cache-file', path.join(cacheDir, '.php-cs-fixer.cache')],
  },
  configFiles: withExts('.php-cs-fixer', ['php', 'dist.php']),
  scopeFile,
  supportedExtensions: extensions.php,
} satisfies Tool;
