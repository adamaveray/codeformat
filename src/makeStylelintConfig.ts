/* eslint sort-keys: "error" -- Organise rules */

import postcssScss from 'postcss-scss';
import { type Config, type CustomSyntax } from 'stylelint';
import orderPlugin from 'stylelint-order';
import scssPlugin from 'stylelint-scss';

import rulesetStylelintCss from '../rulesets/stylelint/ruleset-css.ts';
import rulesetStylelintScss from '../rulesets/stylelint/ruleset-scss.ts';

import extensions from './extensions.ts';

/**
 * @returns The complete Stylelint config.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types -- Preserve specific object shape.
export default function makeStylelintConfig() {
  return {
    defaultSeverity: 'error',
    ignoreFiles: ['**/*.min.*'],
    plugins: [orderPlugin],
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    rules: rulesetStylelintCss,

    // eslint-disable-next-line sort-keys -- Logically positioned.
    overrides: [
      {
        customSyntax: postcssScss as unknown as CustomSyntax,
        files: extensions.scss.map((ext) => `**/*.${ext}`), // Does not support glob braces
        plugins: [scssPlugin],
        rules: rulesetStylelintScss,
      },
    ],
  } satisfies Config;
}
