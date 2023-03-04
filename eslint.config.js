import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

const compat = new FlatCompat({ baseDirectory: path.dirname(fileURLToPath(import.meta.url)) });

export default [
  'eslint:recommended',
  { files: ['**/*.{js,jsx,cjs,cjsx,mjs,mjsx}'] },
  {
    ...compat.plugins('@typescript-eslint')[0],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: typescriptParser },
    rules: {
      ...typescript.configs.base.rules,
      ...typescript.configs['eslint-recommended'].rules,
      ...typescript.configs.strict.rules,
    },
  },
  prettierConfig,
];
