import type { Tool } from '../utils/types.ts';

import { commonExts, withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';

export default {
  exec: runners.viteplus.exec,
  command: 'stylelint',
  actions: (configPath) => ({
    check: ['--allow-empty-input', '--config', configPath, `**/*.{css,scss}`],
    fix: ['--fix', '--allow-empty-input', '--config', configPath, `**/*.{css,scss}`],
  }),
  args: {
    debug: ['--formatter', 'verbose'],
  },
  configFiles: withExts('stylelint.config', [...commonExts.ts, ...commonExts.js]),
} satisfies Tool;
