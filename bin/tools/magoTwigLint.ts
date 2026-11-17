import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import runners from '../utils/runners.ts';
import { buildGlobalArgs, twigScopeFile } from './utils/mago.ts';

export default {
  runner: runners.composer,
  command: 'mago',
  actions: ({ configPath, scopeFilePath }) => {
    const globalArgs = buildGlobalArgs(configPath, scopeFilePath);
    return {
      check: [...globalArgs, 'twig:lint'],
      fix: [...globalArgs, 'twig:lint', '--fix'], // Does not support `--format-after-fix` - modified templates must be formatted separately
    };
  },
  args: {},
  scopeFile: twigScopeFile,
  configFiles: ['mago.toml', 'mago.yaml', 'mago.json'],
  supportedExtensions: extensions.twig,
} satisfies Tool;
