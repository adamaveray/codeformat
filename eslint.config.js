import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import regexpPlugin from 'eslint-plugin-regexp';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';

import convertWarnsToErrors from './lib/convertWarnsToErrors.js';
import rulesetShared from './rulesets/ruleset-shared.js';
import rulesetTypescript from './rulesets/ruleset-typescript.js';

export const extensions = {
  js: ['js', 'jsx', 'cjs', 'cjs', 'mjs', 'mjsx'],
  ts: ['ts', 'tsx', 'cts', 'cts', 'mts', 'mtsx'],
};

export default [
  // JavaScript & TypeScript
  {
    files: [`**/*.{${[...extensions.js, ...extensions.ts].join(',')}}`],
    plugins: {
      'eslint-comments': eslintCommentsPlugin,
      import: importPlugin,
      promise: promisePlugin,
      regexp: regexpPlugin,
      sonarjs: sonarjsPlugin,
      unicorn: unicornPlugin,
    },
    languageOptions: {
      parserOptions: {
        ...importPlugin.configs.recommended.parserOptions,
      },
    },
    settings: {
      'import/parsers': {
        espree: extensions.js.map((extension) => `.${extension}`),
      },
    },
    rules: convertWarnsToErrors(rulesetShared),
  },

  // TypeScript
  {
    files: [`**/*.{${extensions.ts.join(',')}}`],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    settings: {
      ...importPlugin.configs.typescript.settings,
      'import/parsers': {
        '@typescript-eslint/parser': extensions.ts.map((extension) => `.${extension}`),
      },
    },
    rules: convertWarnsToErrors(rulesetTypescript),
  },

  prettierConfig,
];
