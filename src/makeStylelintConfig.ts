import type { Config, CustomSyntax } from 'stylelint';

import postcssScss from 'postcss-scss';
import orderPlugin from 'stylelint-order';
import defensiveCssPlugins from 'stylelint-plugin-defensive-css';
import scssPlugin from 'stylelint-scss';

import * as rulesets from '../rulesets/stylelint.ts';
import extensions from './extensions.ts';

type ConfigRules = NonNullable<Config['rules']>;

/**
 * @param cssRules Additional CSS rules to merge.
 * @param scssRules Additional SCSS rules to merge.
 * @returns The complete Stylelint config.
 */
export default function makeStylelintConfig(cssRules: ConfigRules = {}, scssRules: ConfigRules = {}): Config {
  return {
    defaultSeverity: 'error',
    ignoreFiles: ['**/*.min.*'],
    languageOptions: { directionality: { block: 'top-to-bottom', inline: 'left-to-right' } },
    plugins: [...defensiveCssPlugins, orderPlugin],
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    reportUnscopedDisables: true,
    rules: {
      ...rulesets.css,
      ...cssRules,
    },

    /* oxlint-disable eslint/sort-keys -- Logically positioned. */
    overrides: [
      {
        customSyntax: postcssScss as unknown as CustomSyntax,
        files: extensions.scss.map((ext) => `**/*.${ext}`), // Does not support glob braces
        plugins: [scssPlugin],
        rules: {
          ...rulesets.scss,
          ...scssRules,
        },
      },
    ],
    /* oxlint-enable eslint/sort-keys */
  } satisfies Config;
}
