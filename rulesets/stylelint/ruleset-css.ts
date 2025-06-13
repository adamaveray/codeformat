import propertiesOrder from '@averay/css-properties-sort-order';
import recommended from 'stylelint-config-recommended';
import standard from 'stylelint-config-standard';

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
  'order/order': ['custom-properties', 'declarations'],
  'order/properties-order': [propertiesOrder, { unspecified: 'bottomAlphabetical' }],
};
