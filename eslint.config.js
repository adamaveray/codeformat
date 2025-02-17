import makeEslintConfig from './src/makeEslintConfig.ts';

export default [
  {
    ignores: ['dist/**/*.*'],
  },
  ...makeEslintConfig({ tsconfigPath: './tsconfig.json' }),
];
