import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { withExts } from '../utils/filesystem.ts';
import { buildIgnoreList } from '../utils/ignores.ts';
import runners from '../utils/runners.ts';

export default {
  runner: runners.viteplus.exec,
  command: 'stylelint',
  actions: ({ configPath, scopeFilePath: ignorePath, supportedExtensions }) => {
    const target = `**/*.{${supportedExtensions.join(',')}}`;
    const ignoreArgs = ignorePath == null ? [] : ['--ignore-path', ignorePath];
    return {
      check: ['--allow-empty-input', '--config', configPath, ...ignoreArgs, target],
      fix: ['--fix', '--allow-empty-input', '--config', configPath, ...ignoreArgs, target],
    };
  },
  args: {
    debug: ['--formatter', 'verbose'],
  },
  scopeFile: {
    id: 'stylelintIgnoreList',
    location: { kind: 'scratch', extension: 'ignore' },
    build: (paths) => buildIgnoreList(paths, 'gitignore'),
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
