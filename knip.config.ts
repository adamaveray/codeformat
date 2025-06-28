import type { KnipConfig } from 'knip';

export default {
  ignoreBinaries: ['publish', /^dist\/bin\//u],
  ignoreDependencies: ['bumpp', 'husky'],
  entry: ['src/index.ts', 'bin/codeformat.ts'],
  project: ['src/**/*.ts', 'bin/**/*.ts', 'lib/**/*.ts', 'rulesets/**/*.ts'],
  ignore: ['dist/**'],
} satisfies KnipConfig;
