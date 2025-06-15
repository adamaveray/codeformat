import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import { type Tool } from '../utils/types.ts';

export default {
  exec: runners.bun,
  command: 'eslint',
  actions: (configPath) => ({
    check: ['--config', configPath, '.'],
    fix: ['--fix', '--config', configPath, '.'],
  }),
  args: {
    debug: ['-vvv'],
  },
  configFiles: withExts('eslint.config', ['js', 'mjs', 'cjs', 'ts', 'mts', 'cts']),
} satisfies Tool;
