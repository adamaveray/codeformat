import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';

export default {
  exec: runners.viteplus.exec,
  command: 'stylelint',
  actions: ({ configPath, paths, supportedExtensions }) => {
    const targets = paths ?? [`**/*.{${supportedExtensions.join(',')}}`];
    return {
      check: ['--allow-empty-input', '--config', configPath, ...targets],
      fix: ['--fix', '--allow-empty-input', '--config', configPath, ...targets],
    };
  },
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
