import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

const compat = new FlatCompat({ baseDirectory: path.dirname(fileURLToPath(import.meta.url)) });

export default [
  {
    files: ['**/*.{js,jsx,cjs,cjsx,mjs,mjsx}'],
    rules: js.configs.recommended.rules,
  },
  {
    ...compat.plugins('@typescript-eslint')[0],
    files: ['**/*.{ts,tsx,cts,ctsx,mts,mtsx}'],
    languageOptions: { parser: typescriptParser },
    rules: {
      ...js.configs.recommended.rules,
      ...typescript.configs.base.rules,
      ...typescript.configs['eslint-recommended'].rules,
      ...typescript.configs.strict.rules,
    },
  },
  prettierConfig,
];
