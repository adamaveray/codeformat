import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import { type Tool } from '../utils/types.ts';

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
    ...withExts('prettier.config', ['js', 'ts', 'mjs', 'mts', 'cjs', 'cts']),
    ...withExts('.prettierrc', ['json', 'yml', 'yaml', 'json5', 'js', 'ts', 'mjs', 'mts', 'cjs', 'cts', 'toml']),
  ],
} satisfies Tool;
