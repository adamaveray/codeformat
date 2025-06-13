import propertiesOrder from '@averay/css-properties-sort-order';
import recommended from 'stylelint-config-recommended';
import standard from 'stylelint-config-standard';

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

  'order/order': ['custom-properties', 'declarations'],
  'order/properties-order': [propertiesOrder, { unspecified: 'bottomAlphabetical' }],
};
