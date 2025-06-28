import { commonExts, withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import type { Tool } from '../utils/types.ts';

export default {
  exec: runners.bun,
  command: 'prettier',
  actions: (configPath) => ({
    check: ['--check', '--config', configPath, '.'],
    fix: ['--write', '--config', configPath, '.'],
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
