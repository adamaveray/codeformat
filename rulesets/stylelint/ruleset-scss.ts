import recommended from 'stylelint-config-recommended-scss';
import standard from 'stylelint-config-standard-scss';

import patterns from '../../lib/cssPatterns.ts';

export default {
  ...recommended.rules,
  ...standard.rules,

  // Disable Prettier conflicts
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

  // Naming patterns
  ...{
    'scss/at-function-pattern': patterns.bemWithOptionalSingleUnderscorePrefix,
    'scss/at-mixin-pattern': patterns.bemWithOptionalSingleUnderscorePrefix,
    'scss/dollar-variable-pattern': patterns.bemWithOptionalSingleUnderscorePrefix,
    'scss/percent-placeholder-pattern': patterns.bemWithOptionalSingleUnderscorePrefix,
  },
};
