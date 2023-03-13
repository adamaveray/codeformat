/* eslint sort-keys: "error" -- Organise rules */

import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';

export default {
  ...js.configs.recommended.rules,
  ...importPlugin.configs.typescript.rules,
  ...typescriptPlugin.configs['eslint-recommended'].rules,
  ...typescriptPlugin.configs.recommended.rules,
  ...typescriptPlugin.configs['recommended-requiring-type-checking'].rules,
  ...typescriptPlugin.configs.strict.rules,

  // eslint-disable-next-line unicorn/no-useless-spread -- Keeps the unprefixed core rules together
  ...{
    'default-param-last': 'off',
    'dot-notation': 'off',
    'lines-between-class-members': 'off',
    'no-array-constructor': 'off',
    'no-dupe-class-members': 'off',
    'no-empty-function': 'off',
    'no-implied-eval': 'off',
    'no-invalid-this': 'off',
    'no-loop-func': 'off',
    'no-loss-of-precision': 'off',
    'no-magic-numbers': 'off',
    'no-redeclare': 'off',
    'no-restricted-imports': 'off',
    'no-return-await': 'off',
    'no-shadow': 'off',
    'no-throw-literal': 'off',
    'no-unused-expressions': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'no-useless-constructor': 'off',
    'padding-line-between-statements': 'off',
  },

  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/ban-types': 'error',
  '@typescript-eslint/class-literal-property-style': 'off', // Breaks subclassed getters
  '@typescript-eslint/consistent-indexed-object-style': 'error',
  '@typescript-eslint/consistent-type-assertions': [
    'error',
    { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' },
  ],
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  '@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: true }],
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/default-param-last': 'error',
  '@typescript-eslint/dot-notation': 'error',
  '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
  '@typescript-eslint/explicit-member-accessibility': ['error', { overrides: { constructors: 'no-public' } }],
  '@typescript-eslint/explicit-module-boundary-types': ['error', { allowArgumentsExplicitlyTypedAsAny: true }],
  '@typescript-eslint/member-ordering': 'off',
  '@typescript-eslint/method-signature-style': 'error',
  '@typescript-eslint/naming-convention': [
    'error',
    /* eslint-disable sort-keys -- Logically ordered */
    {
      selector: 'default',
      format: ['camelCase'],
    },
    {
      selector: 'variable',
      modifiers: ['const'],
      format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    },
    {
      selector: 'variable',
      modifiers: ['const'],
      filter: { regex: '^_(static|\\d+)?$', match: true },
      format: ['camelCase'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'parameter',
      format: ['camelCase'],
      leadingUnderscore: 'allow',
    },
    {
      selector: 'property',
      format: ['camelCase', 'UPPER_CASE'],
    },
    {
      selector: 'classProperty',
      modifiers: ['static'],
      format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    },
    {
      selector: 'enumMember',
      format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    },
    {
      selector: 'function',
      format: ['camelCase', 'PascalCase'],
    },
    {
      selector: 'typeLike',
      format: ['PascalCase'],
    },
    {
      selector: ['objectLiteralProperty'],
      format: [],
    },
    {
      selector: ['classProperty', 'objectLiteralMethod'],
      format: ['camelCase', 'UPPER_CASE'],
    },
    {
      selector: 'typeParameter',
      format: ['PascalCase'],
      custom: { regex: '^([A-Z]|T[A-Z][a-zA-Z]+|key)$', match: true },
    },
    /* eslint-enable sort-keys -- Logically ordered */
  ],
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-base-to-string': 'error',
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-confusing-void-expression': 'error',
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-duplicate-imports': 'error',
  '@typescript-eslint/no-empty-function': 'error',
  '@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: true }],
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-for-in-array': 'error',
  '@typescript-eslint/no-implied-eval': 'error',
  '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
  '@typescript-eslint/no-invalid-this': 'error',
  '@typescript-eslint/no-invalid-void-type': 'error',
  '@typescript-eslint/no-loop-func': 'error',
  '@typescript-eslint/no-loss-of-precision': 'error',
  '@typescript-eslint/no-magic-numbers': [
    'error',
    {
      detectObjects: true,
      enforceConst: true,
      ignore: [-1, 0, 1],
      ignoreArrayIndexes: true,
      ignoreClassFieldInitialValues: true,
      ignoreDefaultValues: true,
    },
  ],
  '@typescript-eslint/no-meaningless-void-operator': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/no-redeclare': 'error',
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/no-restricted-imports': 'error',
  '@typescript-eslint/no-shadow': ['error', { hoist: 'all' }],
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-throw-literal': 'error',
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
  '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unused-expressions': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_\\w*$',
      caughtErrorsIgnorePattern: '^_\\w*$',
      varsIgnorePattern: '^(_\\d*|React)$',
    },
  ],
  '@typescript-eslint/no-use-before-define': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/no-var-requires': 'error',
  '@typescript-eslint/non-nullable-type-assertion-style': 'error',
  '@typescript-eslint/padding-line-between-statements': [
    'error',
    /* eslint-disable sort-keys -- Logically ordered */
    { blankLine: 'always', prev: 'directive', next: '*' },
    { blankLine: 'always', prev: 'function', next: 'function' },
    { blankLine: 'never', prev: 'interface', next: 'class' },
    /* eslint-enable sort-keys -- Logically ordered */
  ],
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/prefer-literal-enum-member': 'error',
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': [
    'error',
    { ignoreConditionalTests: false, ignoreMixedLogicalExpressions: false },
  ],
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  '@typescript-eslint/prefer-return-this-type': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',
  '@typescript-eslint/prefer-ts-expect-error': 'error',
  '@typescript-eslint/promise-function-async': 'error',
  '@typescript-eslint/require-array-sort-compare': 'error',
  '@typescript-eslint/restrict-plus-operands': 'error',
  '@typescript-eslint/restrict-template-expressions': 'error',
  '@typescript-eslint/return-await': 'error',
  '@typescript-eslint/strict-boolean-expressions': ['error', { allowNullableString: true }],
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/triple-slash-reference': 'error',
  '@typescript-eslint/unbound-method': 'off', // Does not support @autobind nor recognise binding in constructors
  '@typescript-eslint/unified-signatures': 'error',
};
