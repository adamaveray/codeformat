/* eslint sort-keys: "error" -- Organise rules */

import postcssScss from 'postcss-scss';
import orderPlugin from 'stylelint-order';
import scssPlugin from 'stylelint-scss';

import rulesetStylelintCss from '../rulesets/stylelint/ruleset-css.js';
import rulesetStylelintScss from '../rulesets/stylelint/ruleset-scss.js';

import extensions from './extensions.js';

/**
 * @returns {object} The complete Stylelint config
 */
export default function makeStylelintConfig() {
  return {
    defaultSeverity: 'error',
    ignoreFiles: ['**/*.min.*'],
    plugins: [orderPlugin],
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    rules: rulesetStylelintCss,

    // eslint-disable-next-line sort-keys -- Logically positioned
    overrides: [
      {
        customSyntax: postcssScss,
        files: extensions.scss.map((ext) => `**/*.${ext}`), // Does not support glob braces
        plugins: [scssPlugin],
        rules: rulesetStylelintScss,
      },
    ],
  };
}
