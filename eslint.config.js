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
      'unicorn/no-useless-spread': 'off', // Keep the unprefixed core rules together.
    },
  },

  // CLI
  {
    files: ['bin-*.ts'],
    rules: {
      'no-process-exit': 'off',
    },
  },
];
