import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import { type Tool } from '../utils/types.ts';

export default {
  exec: runners.bun,
  command: 'stylelint',
  actions: (configPath) => ({
    check: ['--allow-empty-input', '--config', configPath, `**/*.{css,sass,scss}`],
    fix: ['--fix', '--allow-empty-input', '--config', configPath, `**/*.{css,sass,scss}`],
  }),
  args: {
    debug: ['--formatter', 'verbose'],
  },
  configFiles: withExts('stylelint.config', ['cjs', 'mjs', 'js']),
} satisfies Tool;
