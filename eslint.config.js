import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.{js,jsx,cjs,cjsx,mjs,mjsx}'],
    rules: js.configs.recommended.rules,
  },
  {
    files: ['**/*.{ts,tsx,cts,ctsx,mts,mtsx}'],
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
