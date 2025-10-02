import type { TSESLint } from '@typescript-eslint/utils';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactYouMightNotNeedAnEffectPlugin from 'eslint-plugin-react-you-might-not-need-an-effect';

const reactHooksPlugin = await import('eslint-plugin-react-hooks').then((module) => module.default);

export default {
  ...jsxA11yPlugin.configs.strict.rules,
  ...reactPlugin.configs.flat['recommended']?.rules,
  ...reactPlugin.configs.flat['jsx-runtime']?.rules,
  ...reactHooksPlugin.configs.recommended.rules,
  ...reactYouMightNotNeedAnEffectPlugin.configs.recommended.rules,

  'jsx-a11y/aria-role': ['error', { allowInvalidRoles: ['text'] }],
  'jsx-a11y/control-has-associated-label': 'error',
  'jsx-a11y/lang': 'error',
  'jsx-a11y/no-aria-hidden-on-focusable': 'error',
  'jsx-a11y/prefer-tag-over-role': 'error',

  'react/button-has-type': 'error',
  'react/checked-requires-onchange-or-readonly': 'error',
  'react/destructuring-assignment': ['error', 'always'],
  'react/forward-ref-uses-ref': 'error',
  'react/function-component-definition': [
    'error',
    { namedComponents: 'function-declaration', unnamedComponents: 'arrow-function' },
  ],
  'react/hook-use-state': ['error', { allowDestructuredState: true }],
  'react/iframe-missing-sandbox': 'error',
  'react/jsx-boolean-value': ['error', 'always'],
  'react/jsx-curly-brace-presence': ['error', { children: 'never', propElementValues: 'always', props: 'never' }],
  'react/jsx-fragments': ['error', 'syntax'],
  'react/jsx-handler-names': [
    'error',
    { checkLocalVariables: true, eventHandlerPrefix: /(handle|set|unset|clear)/u.source },
  ],
  'react/jsx-key': ['error', { checkFragmentShorthand: true, checkKeyMustBeforeSpread: true, warnOnDuplicates: true }],
  'react/jsx-no-bind': ['error', { allowArrowFunctions: true }],
  'react/jsx-no-constructed-context-values': 'error',
  'react/jsx-no-script-url': 'error',
  'react/jsx-no-target-blank': 'off', // No longer required in modern browsers.
  'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
  'react/jsx-pascal-case': 'error',
  'react/jsx-props-no-spread-multi': 'error',
  'react/jsx-sort-props': [
    'error',
    { callbacksLast: true, multiline: 'last', noSortAlphabetically: true, reservedFirst: ['key'] },
  ],
  'react/no-access-state-in-setstate': 'error',
  'react/no-array-index-key': 'error',
  'react/no-arrow-function-lifecycle': 'error',
  'react/no-did-mount-set-state': 'error',
  'react/no-did-update-set-state': 'error',
  'react/no-invalid-html-attribute': 'error',
  'react/no-namespace': 'error',
  'react/no-object-type-as-default-prop': 'error',
  'react/no-redundant-should-component-update': 'error',
  'react/no-set-state': 'error',
  'react/no-this-in-sfc': 'error',
  'react/no-typos': 'error',
  'react/no-unknown-property': ['error', { requireDataLowercase: true }],
  'react/no-unsafe': 'error',
  'react/no-unstable-nested-components': 'error',
  'react/no-unused-class-component-methods': 'error',
  'react/no-unused-prop-types': 'error',
  'react/no-unused-state': 'error',
  'react/no-will-update-set-state': 'error',
  'react/prefer-es6-class': 'error',
  'react/prefer-stateless-function': 'error',
  'react/self-closing-comp': 'error',
} satisfies TSESLint.FlatConfig.Rules;
