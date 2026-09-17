import type { FileExtension, Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { buildIgnoreList } from '../utils/ignores.ts';
import runners from '../utils/runners.ts';

export const additionalExtensions: readonly FileExtension[] = [
  'astro', // Not supported by oxfmt
  'svelte',
  'vue',
];

export default {
  runner: runners.viteplus.cmd,
  command: 'lint',
  actions: ({ scopeFilePath: ignorePath }) => {
    const ignoreArgs = ignorePath == null ? [] : ['--ignore-path', ignorePath];
    return {
      check: [...ignoreArgs],
      fix: ['--fix', ...ignoreArgs],
    };
  },
  args: {
    debug: ['--format', 'default'],
  },
  configFiles: ['vite.config.ts'],
  scopeFile: {
    id: 'vitePlusIgnore',
    location: { kind: 'projectScratch', extension: 'ignore' },
    build: (paths) => buildIgnoreList(paths, 'gitignore'),
  },
  supportedExtensions: [
    ...extensions.js,
    ...extensions.ts,
    ...[...extensions.jsx, ...extensions.tsx].filter((extension) => !/^[cm]/v.test(extension)), // Does not support type-prefixed JSX extensions
    ...additionalExtensions,
  ],
} satisfies Tool;
