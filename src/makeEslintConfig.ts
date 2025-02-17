/* eslint sort-keys: "error" -- Organise rules */

import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import { type TSESLint } from '@typescript-eslint/utils';
import prettierConfig from 'eslint-config-prettier';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import promisePlugin from 'eslint-plugin-promise';
import regexpPlugin from 'eslint-plugin-regexp';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';

import convertWarnsToErrors from '../lib/convertWarnsToErrors.ts';
import rulesetEslintShared from '../rulesets/eslint/ruleset-shared.ts';
import rulesetEslintTypescript, {
  moduleDeclarations as rulesetEslintTypescriptModuleDeclarations,
} from '../rulesets/eslint/ruleset-typescript.ts';

import extensions from './extensions.ts';

interface Options {
  /** The ECMA version to use. */
  ecmaVersion?: TSESLint.FlatConfig.EcmaVersion;
  /** The relative path to the project's `tsconfig.json` file. */
  tsconfigPath?: string;
}

/**
 * @param options Project-specific customisations.
 * @returns The complete ESLint config.
 */
export default function makeEslintConfig({
  ecmaVersion = 'latest',
  tsconfigPath,
}: Options = {}): TSESLint.FlatConfig.Config[] {
  return [
    // JavaScript & TypeScript
    {
      files: [`**/*.{${[...extensions.js, ...extensions.ts].join(',')}}`],
      languageOptions: {
        parserOptions: {
          ecmaVersion,
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
        parserOptions: tsconfigPath == null ? {} : { project: tsconfigPath },
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
        'import/resolver': {
          'eslint-import-resolver-typescript': tsconfigPath == null ? {} : { project: tsconfigPath },
        },
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: rulesetEslintTypescriptModuleDeclarations,
    },

    prettierConfig,
  ];
}
