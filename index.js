/* eslint sort-keys: "error" -- Organise rules */

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

export { default as globals } from 'globals';

export const extensions = {
  js: ['js', 'jsx', 'cjs', 'cjs', 'mjs', 'mjsx'],
  ts: ['ts', 'tsx', 'cts', 'cts', 'mts', 'mtsx'],
};

export function makeEslintConfig(options = {}) {
  return [
    // JavaScript & TypeScript
    {
      files: [`**/*.{${[...extensions.js, ...extensions.ts].join(',')}}`],
      languageOptions: {
        parserOptions: {
          ...importPlugin.configs.recommended.parserOptions,
        },
      },
      plugins: {
        'eslint-comments': eslintCommentsPlugin,
        import: importPlugin,
        promise: promisePlugin,
        regexp: regexpPlugin,
        sonarjs: sonarjsPlugin,
        unicorn: unicornPlugin,
      },
      rules: convertWarnsToErrors(rulesetShared),
      settings: {
        'import/parsers': {
          espree: extensions.js.map((extension) => `.${extension}`),
        },
      },
    },

    // TypeScript
    {
      files: [`**/*.{${extensions.ts.join(',')}}`],
      languageOptions: {
        parser: typescriptParser,
        parserOptions: { project: options.tsconfigPath },
      },
      plugins: {
        '@typescript-eslint': typescriptPlugin,
      },
      rules: convertWarnsToErrors(rulesetTypescript),
      settings: {
        ...importPlugin.configs.typescript.settings,
        'import/parsers': {
          '@typescript-eslint/parser': extensions.ts.map((extension) => `.${extension}`),
        },
      },
    },

    prettierConfig,
  ];
}
