import type { FileExtension, Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { buildIgnoreList } from '../utils/ignores.ts';
import runners from '../utils/runners.ts';

export const additionalExtensions: readonly FileExtension[] = [
  'gql',
  'graphql',
  'handlebars',
  'hbs',
  'html',
  'json',
  'json5',
  'jsonc',
  'less',
  'mdx',
  'mjml',
  'svelte',
  'toml',
  'vue',
];

export default {
  runner: runners.viteplus.cmd,
  command: 'fmt',
  actions: ({ scopeFilePath: ignorePath }) => {
    const ignoreArgs = ignorePath == null ? [] : ['--ignore-path', ignorePath];
    return {
      check: ['--check', ...ignoreArgs],
      fix: [...ignoreArgs],
    };
  },
  args: {},
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
    ...extensions.yaml,
    ...extensions.css,
    ...extensions.md,
    ...extensions.scss,
    ...additionalExtensions,
  ],
} satisfies Tool;
