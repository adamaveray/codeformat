import type { KnipConfig } from 'knip';

export default {
  ignoreBinaries: ['publish', /^dist\/bin\//u],
  ignoreDependencies: [
    // Build tools
    'bumpp',
    'husky',
    // Included to be used by consumers
    /^@prettier\/plugin-/u,
    // To be dealt with
    'typescript-eslint',
  ],
  ignoreExportsUsedInFile: true,
  entry: ['src/index.ts', 'bin/codeformat.ts'],
  project: ['src/**/*.ts', 'bin/**/*.ts', 'lib/**/*.ts', 'rulesets/**/*.ts'],
  ignore: ['dist/**'],
} satisfies KnipConfig;
