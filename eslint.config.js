import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export const extensions = {
  js: 'js,jsx,cjs,cjsx,mjs,mjsx',
  ts: 'ts,tsx,cts,ctsx,mts,mtsx',
};
export default [
  {
    files: [`**/*.{${extensions.js}}`],
    rules: js.configs.recommended.rules,
  },
  {
    files: [`**/*.{${extensions.ts}}`],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescriptPlugin.configs['eslint-recommended'].rules,
      ...typescriptPlugin.configs.recommended.rules,
      ...typescriptPlugin.configs['recommended-requiring-type-checking'].rules,
      ...typescriptPlugin.configs.strict.rules,
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettierConfig,
];
