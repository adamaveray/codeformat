import type { Tool } from '../utils/types.ts';

import { commonExts, withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';

export default {
  exec: runners.bun,
  command: 'prettier',
  actions: (configPath) => ({
    // Only target file types not handled by Oxfmt (PHP, XML, INI)
    check: ['--check', '--config', configPath, '**/*.{php,xml,ini}'],
    fix: ['--write', '--config', configPath, '**/*.{php,xml,ini}'],
  }),
  args: {
    debug: ['--log-level', 'debug'],
  },
  configFiles: [
    '.prettierrc',
    ...withExts('prettier.config', [...commonExts.js, ...commonExts.ts]),
    ...withExts('.prettierrc', ['json', 'json5', 'toml', ...commonExts.yaml, ...commonExts.js, ...commonExts.ts]),
  ],
} satisfies Tool;
