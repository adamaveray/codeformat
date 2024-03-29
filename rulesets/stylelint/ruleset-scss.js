/* eslint sort-keys: "error" -- Organise rules */

import recommended from 'stylelint-config-recommended-scss';
import standard from 'stylelint-config-standard-scss';

const serialiseRegex = (pattern) => String(pattern).replace(/^\/(.*)\/[a-z]*$/u, '$1');

const CUSTOM_KEYWORD_PATTERN = /^_?[a-z][\da-z]*((-|--|__)[\da-z]+)*$/u; // eslint-disable-line unicorn/no-unsafe-regex -- Complex syntax

export default {
  ...recommended.rules,
  ...standard.rules,

  'order/order': [
    /* eslint-disable sort-keys -- Improves legibility */
    { type: 'at-rule', name: 'function' },
    { type: 'at-rule', name: 'mixin' },
    'dollar-variables',
    { type: 'at-rule', name: 'extend' },
    { type: 'at-rule', name: 'include' },
    { type: 'at-rule', name: 'import' },
    'custom-properties',
    'declarations',
    /* eslint-enable sort-keys -- Improves legibility */
  ],

  // eslint-disable-next-line unicorn/no-useless-spread -- Disabling Prettier-conflicting legacy rules
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
  'scss/at-function-pattern': serialiseRegex(CUSTOM_KEYWORD_PATTERN),
  'scss/at-mixin-pattern': serialiseRegex(CUSTOM_KEYWORD_PATTERN),
  'scss/dollar-variable-pattern': serialiseRegex(CUSTOM_KEYWORD_PATTERN),
};
