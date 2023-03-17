/* eslint sort-keys: "error" -- Organise rules */

import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import promisePlugin from 'eslint-plugin-promise';
import regexpPlugin from 'eslint-plugin-regexp';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';

import convertWarnsToErrors from '../lib/convertWarnsToErrors.js';
import rulesetEslintShared from '../rulesets/eslint/ruleset-shared.js';
import rulesetEslintTypescript from '../rulesets/eslint/ruleset-typescript.js';

import extensions from './extensions.js';

/**
 * @param {{ tsconfigPath?: string }} options Project-specific customisations
 * @returns {object[]} The complete ESLint config
 */
export default function makeEslintConfig(options = {}) {
  return [
    // JavaScript & TypeScript
    {
      files: [`**/*.{${[...extensions.js, ...extensions.ts].join(',')}}`],
      languageOptions: {
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      linterOptions: {
        reportUnusedDisableDirectives: true,
      },
      plugins: {
        'eslint-comments': eslintCommentsPlugin,
        import: importPlugin,
        jsdoc: jsdocPlugin,
        promise: promisePlugin,
        regexp: regexpPlugin,
        sonarjs: sonarjsPlugin,
        unicorn: unicornPlugin,
      },
      rules: convertWarnsToErrors(rulesetEslintShared),
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
        parserOptions: options.tsconfigPath == null ? {} : { project: options.tsconfigPath },
      },
      plugins: {
        '@typescript-eslint': typescriptPlugin,
      },
      rules: convertWarnsToErrors(rulesetEslintTypescript),
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
