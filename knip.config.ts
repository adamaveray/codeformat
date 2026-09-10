import type { KnipConfig } from 'knip';

export default {
  ignoreDependencies: [
    // Build tools
    'bumpp',
    'vite',
  ],
  ignoreExportsUsedInFile: true,
  entry: ['src/index.ts', 'bin/codeformat.ts'],
  project: ['src/**/*.ts', 'bin/**/*.ts', 'lib/**/*.ts', 'rulesets/**/*.ts'],
} satisfies KnipConfig;
