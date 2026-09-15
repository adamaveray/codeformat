import type { Config, CustomSyntax, Plugin } from 'stylelint';

import postcssScss from 'postcss-scss';
import orderPlugin from 'stylelint-order';
import defensiveCssPlugins from 'stylelint-plugin-defensive-css';
import scssPlugin from 'stylelint-scss';

import * as rulesets from '../rulesets/stylelint.ts';
import extensions from './extensions.ts';

type ConfigRules = NonNullable<Config['rules']>;

interface Options {
  /** Additional file patterns to exclude from linting. */
  ignoreFiles?: readonly string[];
  /** Additional overrides, appended after the built-in ones. */
  overrides?: NonNullable<Config['overrides']>;
  /** Additional plugins to load. */
  plugins?: readonly (Plugin | string)[];
  /** Additional syntax-specific rules to merge. */
  rules?: {
    css?: ConfigRules;
    scss?: ConfigRules;
  };
}

/**
 * @param options Project-specific customisations.
 * @returns The complete Stylelint config.
 */
export default function makeStylelintConfig({
  ignoreFiles = [],
  overrides = [],
  plugins = [],
  rules = {},
}: Options = {}): Config {
  return {
    defaultSeverity: 'error',
    ignoreFiles: ['**/*.min.*', ...ignoreFiles],
    languageOptions: { directionality: { block: 'top-to-bottom', inline: 'left-to-right' } },
    plugins: [...defensiveCssPlugins, orderPlugin, ...plugins],
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    reportUnscopedDisables: true,
    rules: {
      ...rulesets.css,
      ...rules.css,
    },

    /* oxlint-disable eslint/sort-keys -- Logically positioned. */
    overrides: [
      {
        customSyntax: postcssScss as unknown as CustomSyntax,
        files: extensions.scss.map((ext) => `**/*.${ext}`), // Does not support glob braces
        plugins: [scssPlugin],
        rules: {
          ...rulesets.scss,
          ...rules.scss,
        },
      },
      ...overrides,
    ],
    /* oxlint-enable eslint/sort-keys */
  } satisfies Config;
}
