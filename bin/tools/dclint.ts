import type { Tool } from '../utils/types.ts';

import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';

const configExtensions = ['json', 'yaml', 'yml', 'js', 'ts', 'cjs'] satisfies string[];
const scriptExtensions = ['js', 'ts', 'cjs'] satisfies string[];

export default {
  runner: runners.viteplus.exec,
  command: 'dclint',
  actions: ({ configPath }) => {
    const commonArgs = ['--config', configPath, '--recursive', '.'];
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
  perFile: false,
} satisfies Tool;
