import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';

export default {
  exec: runners.viteplus.exec,
  command: 'stylelint',
  actions: ({ configPath, supportedExtensions }) => ({
    check: ['--allow-empty-input', '--config', configPath, `**/*.{${supportedExtensions.join(',')}}`],
    fix: ['--fix', '--allow-empty-input', '--config', configPath, `**/*.{${supportedExtensions.join(',')}}`],
  }),
  args: {
    debug: ['--formatter', 'verbose'],
  },
  configFiles: withExts('stylelint.config', [...extensions.ts, ...extensions.js]),
  supportedExtensions: [
    ...extensions.css,
    ...extensions.scss,
    ...extensions.html,
    ...extensions.htmlLike,
    ...extensions.jsx,
    ...extensions.tsx,
    'pcss',
    'postcss',
  ],
} satisfies Tool;
