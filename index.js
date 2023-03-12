import eslintConfig, { extensions } from './eslint.config.js';

export { default as globals } from 'globals';
export { default as eslintConfig, extensions } from './eslint.config.js';

export function makeEslintConfig(options) {
  return [
    ...eslintConfig,
    {
      files: [`**/*.{${extensions.ts.join(',')}}`],
      languageOptions: {
        parserOptions: { project: options.tsconfigPath },
      },
    },
  ];
}
