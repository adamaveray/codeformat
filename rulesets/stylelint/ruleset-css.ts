import propertiesOrder from '@averay/css-properties-sort-order';
import recommended from 'stylelint-config-recommended';
import standard from 'stylelint-config-standard';
import defensiveCssStrict from 'stylelint-plugin-defensive-css/configs/strict';

import patterns from '../../lib/cssPatterns.ts';

export default {
  ...recommended.rules,
  ...standard.rules,

  // Core rules
  ...{
    'color-named': 'never',
    'function-url-no-scheme-relative': true,
  },

  // Disable Prettier conflicts
  ...{
    'at-rule-empty-line-before': null,
    'comment-empty-line-before': null,
    'rule-empty-line-before': null,
  },

  // Patterns
  ...{
    'container-name-pattern': patterns.bem,
    'custom-media-pattern': patterns.bem,
    'custom-property-pattern': patterns.bem,
    'keyframes-name-pattern': patterns.bem,
    'layer-name-pattern': patterns.bem,
    'selector-class-pattern': patterns.bemWithOptionalUnderscoresPrefix,
    'selector-id-pattern': patterns.kebab,
  },

  // Extensions
  'csstools/use-logical': 'always',

  ...defensiveCssStrict.rules,
  'defensive-css/require-custom-property-fallback': null, // Makes using custom properties too burdensome.
  'defensive-css/require-flex-wrap': null, // Not wrapping is the default for a reason.
  'defensive-css/require-scrollbar-gutter': null, // Ruins the aesthetic to accommodate edge cases.

  'order/order': ['custom-properties', 'declarations'],
  'order/properties-order': [propertiesOrder, { unspecified: 'bottomAlphabetical' }],
} as const;
