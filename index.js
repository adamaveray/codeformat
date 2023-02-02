import eslintConfig from './eslint.config.js';

export { default as eslintConfig } from './eslint.config.js';

export function makeEslintConfig(options) {
  return [
    ...eslintConfig,
    {
      files: ['**/*.{ts,tsx,cts,ctsx,mts,mtsx}'],
      languageOptions: {
        parserOptions: { project: options.tsconfigPath },
      },
    },
  ];
}
