import { makeEslintConfig } from './dist/codeformat.mjs';

export default [
  {
    ignores: ['dist/**/*.*'],
  },
  ...makeEslintConfig(),
];
