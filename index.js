import eslintConfig, { extensions } from './eslint.config.js';

export { default as eslintConfig, extensions } from './eslint.config.js';

export function makeEslintConfig(options) {
  return [
    ...eslintConfig,
    {
      files: [`**/*.{${extensions.ts}}`],
      languageOptions: {
        parserOptions: { project: options.tsconfigPath },
      },
    },
  ];
}
