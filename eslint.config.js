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

  // CLI
  {
    files: ['bin-*.ts'],
    rules: {
      'no-process-exit': 'off',
    },
  },
];
