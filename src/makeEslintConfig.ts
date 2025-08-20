/* eslint sort-keys: "error" -- Organise rules */

import markdownPlugin from '@eslint/markdown';
import stylisticPlugin from '@stylistic/eslint-plugin';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import type { TSESLint } from '@typescript-eslint/utils';
import prettierConfig from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import { importX as importXPlugin } from 'eslint-plugin-import-x';
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
    // Markdown
    ...markdownPlugin.configs.recommended,

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
        '@stylistic': stylisticPlugin,
        'eslint-comments': eslintCommentsPlugin,
        'import-x': importXPlugin,
        jsdoc: jsdocPlugin,
        promise: promisePlugin,
        regexp: regexpPlugin,
        sonarjs: sonarjsPlugin,
        unicorn: unicornPlugin,
      },
      rules: convertWarnsToErrors(rulesetEslintShared),
      settings: {
        'import-x/parsers': {
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
        ...importXPlugin.configs.typescript.settings,
        'import-x/parsers': {
          '@typescript-eslint/parser': extensions.ts.map((extension) => `.${extension}`),
        },
        'import-x/resolver-next': createTypeScriptImportResolver(tsconfigPath == null ? {} : { project: tsconfigPath }),
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: rulesetEslintTypescriptModuleDeclarations,
    },

    prettierConfig,
  ];
}
