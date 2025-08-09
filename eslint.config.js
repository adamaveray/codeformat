import globals from 'globals';

import makeEslintConfig from './src/makeEslintConfig.ts';

export default [
  {
    ignores: ['dist/**/*.*'],
  },
  ...makeEslintConfig({ tsconfigPath: './tsconfig.json' }),
  {
    languageOptions: {
      globals: { Bun: true, ...globals.node },
    },
  },

  // Rulesets
  {
    files: ['rulesets/**/*.ts'],
    rules: {
      'sort-keys': 'error', // Organise rules.
      '@typescript-eslint/no-magic-numbers': 'off', // All numbers are defining configuration options.
      'unicorn/no-useless-spread': 'off', // Keep the unprefixed core rules together.
    },
  },

  // CLI
  {
    files: ['bin/**/*.ts'],
    rules: {
      'no-process-env': 'off',
      'no-process-exit': 'off',
      'unicorn/no-process-exit': 'off',
    },
  },
];
