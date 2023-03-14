/* eslint sort-keys: "error" -- Organise rules */

import recommended from 'stylelint-config-recommended';
import standard from 'stylelint-config-standard';

import propertiesOrderingGroups from '../../data/cssPropertySortOrderSmacss.js';

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
  'order/properties-order': [Object.values(propertiesOrderingGroups).flat(), { unspecified: 'bottomAlphabetical' }],
};
