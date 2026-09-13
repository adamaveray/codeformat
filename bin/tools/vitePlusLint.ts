import type { FileExtension, Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import runners from '../utils/runners.ts';

export const additionalExtensions: readonly FileExtension[] = [
  'astro', // Not supported by oxfmt
  'svelte',
  'vue',
];

export default {
  exec: runners.viteplus.cmd,
  command: 'lint',
  actions: () => ({
    check: [],
    fix: ['--fix'],
  }),
  args: {
    debug: ['--format', 'default'],
  },
  configFiles: ['vite.config.ts'],
  supportedExtensions: [
    ...extensions.js,
    ...extensions.ts,
    ...[...extensions.jsx, ...extensions.tsx].filter((extension) => !/^[cm]/v.test(extension)), // Does not support type-prefixed JSX extensions
    ...additionalExtensions,
  ],
} satisfies Tool;
