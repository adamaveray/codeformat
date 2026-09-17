import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import runners from '../utils/runners.ts';
import { buildGlobalArgs, scopeFile } from './utils/mago.ts';

export default {
  runner: runners.composer,
  command: 'mago',
  actions: ({ configPath, scopeFilePath }) => {
    const globalArgs = buildGlobalArgs(configPath, scopeFilePath);
    return {
      check: [...globalArgs, 'lint'],
      fix: [...globalArgs, 'lint', '--fix'],
    };
  },
  args: {},
  scopeFile,
  configFiles: ['mago.toml', 'mago.yaml', 'mago.json'],
  supportedExtensions: extensions.php,
} satisfies Tool;
