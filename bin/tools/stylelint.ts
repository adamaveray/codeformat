import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';

export default {
  exec: runners.viteplus.exec,
  command: 'stylelint',
  actions: ({ configPath }) => ({
    check: ['--allow-empty-input', '--config', configPath, `**/*.{css,scss}`],
    fix: ['--fix', '--allow-empty-input', '--config', configPath, `**/*.{css,scss}`],
  }),
  args: {
    debug: ['--formatter', 'verbose'],
  },
  configFiles: withExts('stylelint.config', [...extensions.ts, ...extensions.js]),
} satisfies Tool;
