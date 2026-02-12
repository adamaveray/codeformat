/* eslint sort-keys: "error" -- Organise rules */

import markdownPlugin from '@eslint/markdown';
import eslintCommentsPlugin from '@eslint-community/eslint-plugin-eslint-comments';
import stylisticPlugin from '@stylistic/eslint-plugin';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import type { TSESLint } from '@typescript-eslint/utils';
import prettierConfig from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX as importXPlugin } from 'eslint-plugin-import-x';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import promisePlugin from 'eslint-plugin-promise';
import reactPlugin from 'eslint-plugin-react';
import reactYouMightNotNeedAnEffectPlugin from 'eslint-plugin-react-you-might-not-need-an-effect';
import regexpPlugin from 'eslint-plugin-regexp';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';

import { findFirstFile } from '../bin/utils/filesystem.ts';
import convertWarnsToErrors from '../lib/convertWarnsToErrors.ts';
import rulesetEslintJsx from '../rulesets/eslint/ruleset-jsx.ts';
import rulesetEslintMarkdown from '../rulesets/eslint/ruleset-markdown.ts';
import rulesetEslintShared from '../rulesets/eslint/ruleset-shared.ts';
import rulesetEslintTypescript, {
  moduleDeclarations as rulesetEslintTypescriptModuleDeclarations,
} from '../rulesets/eslint/ruleset-typescript.ts';

import extensions from './extensions.ts';

const reactHooksPlugin = await import('eslint-plugin-react-hooks').then((module) => module.default);

interface Options {
  /** The ECMA version to use. */
  ecmaVersion?: TSESLint.FlatConfig.EcmaVersion;
  /** The absolute path to the project's root. */
  rootPath?: string;
  /** The relative path to the project's `tsconfig.json` file. */
  tsconfigPath?: string;
  /** Whether the project uses the Bun runtime. */
  isBun?: boolean;
}

/**
 * @param options Project-specific customisations.
 * @returns The complete ESLint config.
 */
export default function makeEslintConfig({
  ecmaVersion = 'latest',
  rootPath = process.cwd(),
  tsconfigPath,
  isBun,
}: Options = {}): TSESLint.FlatConfig.Config[] {
  isBun ??= findFirstFile(rootPath, ['bun.lock', 'bunfig.toml']) != null;
  return [
    prettierConfig,

    // Markdown
    {
      files: [`**/*.{${extensions.md.join(',')}}`],
      language: 'markdown/commonmark',
      plugins: { markdown: markdownPlugin },
      rules: convertWarnsToErrors(rulesetEslintMarkdown),
    },

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
        '@eslint-community/eslint-comments': eslintCommentsPlugin,
        '@stylistic': stylisticPlugin,
        'import-x': importXPlugin,
        jsdoc: jsdocPlugin,
        promise: promisePlugin,
        regexp: regexpPlugin,
        sonarjs: sonarjsPlugin,
        unicorn: unicornPlugin,
      },
      rules: convertWarnsToErrors(rulesetEslintShared),
      settings: {
        'import-x/core-modules': [
          // Treat Bun as core module even when running under Node.
          ...(isBun ? ['bun', 'bun:test'] : []),
        ],
        'import-x/parsers': {
          espree: extensions.js.map((extension) => `.${extension}`),
        },
      },
    },
    {
      files: [`**/*.{${[...extensions.jsx, ...extensions.tsx].join(',')}}`],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
        ...jsxA11yPlugin.flatConfigs.strict.languageOptions,
        ...reactPlugin.configs.flat['recommended']?.languageOptions,
        ...reactPlugin.configs.flat['jsx-runtime']?.languageOptions,
      },
      plugins: {
        'jsx-a11y': jsxA11yPlugin,
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
        'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffectPlugin,
      },
      rules: convertWarnsToErrors(rulesetEslintJsx),
      settings: {
        react: { version: 'detect' },
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
      rules: convertWarnsToErrors(rulesetEslintTypescriptModuleDeclarations),
    },
  ];
}
