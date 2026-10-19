import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import { scopeFile } from './utils/dclint.ts';

const configExtensions = ['json', 'yaml', 'yml', 'js', 'ts', 'cjs'] satisfies string[];
const scriptExtensions = ['js', 'ts', 'cjs'] satisfies string[];

export default {
  runner: runners.viteplus.exec,
  command: 'dclint',
  actions: ({ configPath, rootPath, scopeFilePath }) => {
    const commonArgs =
      scopeFilePath == null
        ? ['--config', configPath, '--recursive', '.']
        : ['--config', scopeFilePath, '--recursive', rootPath];
    return {
      check: commonArgs,
      fix: ['--fix', ...commonArgs],
    };
  },
  args: {
    debug: ['--debug'],
  },
  configFiles: [
    '.dclintrc',
    ...withExts('.dclintrc', configExtensions),
    '.config/dclintrc',
    ...withExts('.config/dclintrc', configExtensions),
    ...withExts('dclint.config', scriptExtensions),
  ],
  scopeFile,
  supportedExtensions: extensions.yaml,
} satisfies Tool;
