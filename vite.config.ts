import { defineConfig } from 'vite-plus';

import makeOxfmtConfig from './src/makeOxfmtConfig.ts';
import makeOxlintConfig from './src/makeOxlintConfig.ts';

export default defineConfig({
  fmt: makeOxfmtConfig(),
  lint: makeOxlintConfig({
    tsconfigPath: './tsconfig.json',
    overrides: [
      {
        files: ['rulesets/*.ts', 'src/make*Config.ts'],
        rules: {
          'eslint/sort-keys': 'error',
          'unicorn/no-useless-spread': 'off', // Allow useless spreads in ruleset files (keeps unprefixed core rules visually grouped)
        },
      },
      {
        files: ['bin/**/*.ts'],
        rules: {
          'node/no-process-env': 'off',
          'unicorn/no-process-exit': 'off',
        },
      },
    ],
  }),
  test: {
    setupFiles: ['testExtensions.ts'],
  },
});
