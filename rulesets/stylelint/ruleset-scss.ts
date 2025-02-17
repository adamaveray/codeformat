/* eslint sort-keys: "error" -- Organise rules. */
/* eslint unicorn/no-useless-spread: "off" -- Keep the unprefixed core rules together. */

import recommended from 'stylelint-config-recommended-scss';
import standard from 'stylelint-config-standard-scss';

const CUSTOM_KEYWORD_PATTERN = /^_?[a-z][\da-z]*((-|--|__)[\da-z]+)*$/u;

export default {
  ...recommended.rules,
  ...standard.rules,

  // Disable Prettier-conflicting legacy rules.
  ...{
    'scss/at-else-closing-brace-newline-after': null,
    'scss/at-else-closing-brace-space-after': null,
    'scss/at-else-empty-line-before': null,
    'scss/at-else-if-parentheses-space-before': null,
    'scss/at-function-parentheses-space-before': null,
    'scss/at-if-closing-brace-newline-after': null,
    'scss/at-if-closing-brace-space-after': null,
    'scss/at-mixin-parentheses-space-before': null,
    'scss/dollar-variable-colon-newline-after': null,
    'scss/dollar-variable-colon-space-after': null,
    'scss/dollar-variable-colon-space-before': null,
    'scss/operator-no-newline-after': null,
    'scss/operator-no-newline-before': null,
    'scss/operator-no-unspaced': null,
  },
  'scss/at-function-pattern': CUSTOM_KEYWORD_PATTERN.source,
  'scss/at-mixin-pattern': CUSTOM_KEYWORD_PATTERN.source,
  'scss/dollar-variable-pattern': CUSTOM_KEYWORD_PATTERN.source,
};
