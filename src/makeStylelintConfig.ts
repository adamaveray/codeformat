import type { Config, CustomSyntax } from 'stylelint';

import postcssScss from 'postcss-scss';
import orderPlugin from 'stylelint-order';
import defensiveCssPlugins from 'stylelint-plugin-defensive-css';
import scssPlugin from 'stylelint-scss';
import useLogicalPlugin from 'stylelint-use-logical';

import rulesetStylelintCss from '../rulesets/stylelint/ruleset-css.ts';
import rulesetStylelintScss from '../rulesets/stylelint/ruleset-scss.ts';
import extensions from './extensions.ts';

type ConfigRules = Config['rules'];

/**
 * @param cssRules Additional CSS rules to merge.
 * @param scssRules Additional SCSS rules to merge.
 * @returns The complete Stylelint config.
 */
export default function makeStylelintConfig(cssRules: ConfigRules = {}, scssRules: ConfigRules = {}): Config {
  return {
    defaultSeverity: 'error',
    ignoreFiles: ['**/*.min.*'],
    plugins: [...defensiveCssPlugins, orderPlugin, useLogicalPlugin],
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    rules: {
      ...rulesetStylelintCss,
      ...cssRules,
    },

    /* oxlint-disable eslint/sort-keys -- Logically positioned. */
    overrides: [
      {
        customSyntax: postcssScss as unknown as CustomSyntax,
        files: extensions.scss.map((ext) => `**/*.${ext}`), // Does not support glob braces
        plugins: [scssPlugin],
        rules: {
          ...rulesetStylelintScss,
          ...scssRules,
        },
      },
    ],
    /* oxlint-enable eslint/sort-keys */
  } satisfies Config;
}
