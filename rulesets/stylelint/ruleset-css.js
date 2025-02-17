/* eslint sort-keys: "error" -- Organise rules */

import propertiesOrder from '@averay/css-properties-sort-order';
import recommended from 'stylelint-config-recommended';
import standard from 'stylelint-config-standard';

export default {
  ...recommended.rules,
  ...standard.rules,

  // eslint-disable-next-line unicorn/no-useless-spread -- Keeps the unprefixed core rules together
  ...{
    'at-rule-empty-line-before': null,
    'color-named': 'never',
    'comment-empty-line-before': null,
    'function-url-no-scheme-relative': true,
    'rule-empty-line-before': null,
  },

  'order/order': ['custom-properties', 'declarations'],
  'order/properties-order': [propertiesOrder, { unspecified: 'bottomAlphabetical' }],
};
