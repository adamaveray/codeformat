/* oxlint-disable no-magic-numbers -- Defining configuration settings. */
import type { DummyRuleMap } from 'vite-plus/lint';

export const shared = {
  'eslint/accessor-pairs': ['error', { setWithoutGet: true }],
  'eslint/arrow-body-style': 'off', // Too opinionated
  'eslint/block-scoped-var': 'error',
  'eslint/capitalized-comments': [
    'error',
    'always',
    {
      ignoreConsecutiveComments: true,
      ignorePattern: /language=/v.source,
    },
  ],
  'eslint/class-methods-use-this': 'off', // Too opinionated
  'eslint/complexity': 'off', // Too opinionated
  'eslint/constructor-super': 'error',
  'eslint/curly': ['error', 'all'],
  'eslint/default-case': 'off', // Superseded by typescript/switch-exhaustiveness-check
  'eslint/eqeqeq': ['error', 'always', { null: 'ignore' }],
  'eslint/for-direction': 'error',
  'eslint/func-names': ['error', 'as-needed'],
  'eslint/func-style': ['error', 'declaration', { allowArrowFunctions: true }],
  'eslint/getter-return': 'error',
  'eslint/grouped-accessor-pairs': ['error', 'getBeforeSet'],
  'eslint/id-length': 'off', // Flags single-letter generic type parameters
  'eslint/init-declarations': 'off', // Often necessary to initialise after declaration
  'eslint/max-classes-per-file': 'off', // Too opinionated
  'eslint/max-depth': 'off', // Too opinionated
  'eslint/max-lines': 'off', // Too opinionated
  'eslint/max-lines-per-function': 'off', // Too opinionated
  'eslint/max-params': 'off', // Too opinionated
  'eslint/max-statements': 'off', // Too opinionated
  'eslint/no-alert': 'error',
  'eslint/no-async-promise-executor': 'error',
  'eslint/no-await-in-loop': 'off', // It is very common to need to process a loop sequentially.
  'eslint/no-bitwise': 'error',
  'eslint/no-caller': 'error',
  'eslint/no-class-assign': 'error',
  'eslint/no-compare-neg-zero': 'error',
  'eslint/no-cond-assign': 'error',
  'eslint/no-console': 'off', // Too opinionated
  'eslint/no-const-assign': 'error',
  'eslint/no-constant-binary-expression': 'error',
  'eslint/no-constant-condition': 'error',
  'eslint/no-continue': 'off', // Too opinionated
  'eslint/no-control-regex': 'error',
  'eslint/no-debugger': 'error',
  'eslint/no-delete-var': 'error',
  'eslint/no-div-regex': 'error',
  'eslint/no-dupe-class-members': 'error',
  'eslint/no-dupe-else-if': 'error',
  'eslint/no-dupe-keys': 'error',
  'eslint/no-duplicate-case': 'error',
  'eslint/no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
  'eslint/no-else-return': 'off', // Sometimes clearer
  'eslint/no-empty': 'error',
  'eslint/no-empty-character-class': 'error',
  'eslint/no-empty-function': 'error',
  'eslint/no-empty-pattern': 'error',
  'eslint/no-empty-static-block': 'error',
  'eslint/no-eq-null': 'off', // Best way to test for "null or undefined"
  'eslint/no-eval': 'error',
  'eslint/no-ex-assign': 'error',
  'eslint/no-extend-native': 'error',
  'eslint/no-extra-bind': 'error',
  'eslint/no-extra-boolean-cast': 'error',
  'eslint/no-func-assign': 'error',
  'eslint/no-global-assign': 'error',
  'eslint/no-implicit-globals': 'off', // Not an issue in ESM
  'eslint/no-import-assign': 'error',
  'eslint/no-inline-comments': 'off', // Too opinionated
  'eslint/no-invalid-regexp': 'error',
  'eslint/no-irregular-whitespace': 'error',
  'eslint/no-iterator': 'error',
  'eslint/no-labels': ['error', { allowLoop: true }],
  'eslint/no-lonely-if': 'off', // Too opinionated
  'eslint/no-loss-of-precision': 'error',
  'eslint/no-magic-numbers': [
    'error',
    {
      detectObjects: true,
      enforceConst: true,
      ignore: [-1, 0, 1, 100],
      ignoreClassFieldInitialValues: true,
      ignoreEnums: true,
      ignoreNumericLiteralTypes: true,
      ignoreReadonlyClassProperties: true,
      ignoreTypeIndexes: true,
    },
  ],
  'eslint/no-misleading-character-class': 'error',
  'eslint/no-nested-ternary': 'off', // Defer to equivalent unicorn rule
  'eslint/no-new': 'error',
  'eslint/no-new-native-nonconstructor': 'error',
  'eslint/no-nonoctal-decimal-escape': 'error',
  'eslint/no-obj-calls': 'error',
  'eslint/no-plusplus': 'error',
  'eslint/no-proto': 'error',
  'eslint/no-regex-spaces': 'error',
  'eslint/no-restricted-globals': ['error', 'event'],
  'eslint/no-self-assign': 'error',
  'eslint/no-sequences': 'error',
  'eslint/no-setter-return': 'error',
  'eslint/no-shadow': ['error', { hoist: 'all' }],
  'eslint/no-shadow-restricted-names': 'error',
  'eslint/no-sparse-arrays': 'error',
  'eslint/no-ternary': 'off', // Unwanted
  'eslint/no-this-before-super': 'error',
  'eslint/no-undef': 'error',
  'eslint/no-undefined': 'off', // Necessary for strict comparison
  'eslint/no-underscore-dangle': 'off', // Allowed by no-unused-vars pattern
  'eslint/no-unmodified-loop-condition': 'error',
  'eslint/no-unneeded-ternary': 'error',
  'eslint/no-unreachable': 'error',
  'eslint/no-unreachable-loop': 'error', // (Nursery rule)
  'eslint/no-unsafe-finally': 'error',
  'eslint/no-unsafe-negation': 'error',
  'eslint/no-unsafe-optional-chaining': 'error',
  'eslint/no-unused-expressions': 'error',
  'eslint/no-unused-labels': 'error',
  'eslint/no-unused-private-class-members': 'error',
  'eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: /^_\w*$/v.source,
      caughtErrorsIgnorePattern: /^_\w*$/v.source,
      varsIgnorePattern: /^(?:_\d*|React)$/v.source,
    },
  ],
  'eslint/no-use-before-define': 'error',
  'eslint/no-useless-assignment': 'error', // (Nursery rule)
  'eslint/no-useless-backreference': 'error',
  'eslint/no-useless-call': 'error',
  'eslint/no-useless-catch': 'error',
  'eslint/no-useless-computed-key': ['error', { enforceForClassMembers: true }],
  'eslint/no-useless-concat': 'error',
  'eslint/no-useless-constructor': 'error',
  'eslint/no-useless-escape': 'error',
  'eslint/no-useless-rename': 'error',
  'eslint/no-var': 'error',
  'eslint/no-void': 'error',
  'eslint/no-warning-comments': 'off', // Too opinionated
  'eslint/no-with': 'error',
  'eslint/one-var': ['error', 'never'],
  'eslint/prefer-destructuring': 'off', // Too opinionated
  'eslint/prefer-promise-reject-errors': 'off', // Defer to typescript/prefer-promise-reject-errors
  'eslint/require-await': 'off', // Flags non-async implementations of required-async interfaces
  'eslint/require-unicode-regexp': ['error', { requireFlag: 'v' }],
  'eslint/require-yield': 'error',
  'eslint/sort-imports': 'off', // Defer to oxfmt
  'eslint/sort-keys': 'off', // Too opinionated
  'eslint/sort-vars': 'off', // Too opinionated
  'eslint/use-isnan': 'error',
  'eslint/valid-typeof': 'error',

  'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
  'import/export': 'error', // (Nursery rule)
  'import/exports-last': 'off', // Too opinionated
  'import/extensions': ['error', 'ignorePackages', { checkTypeImports: true }],
  'import/group-exports': 'off', // Too opinionated
  'import/max-dependencies': 'off', // Too opinionated
  'import/no-absolute-path': 'error',
  'import/no-amd': 'error',
  'import/no-anonymous-default-export': [
    'error',
    {
      allowArray: true,
      allowCallExpression: true,
      allowLiteral: true,
      allowNew: true,
      allowObject: true,
    },
  ],
  'import/no-commonjs': 'error',
  'import/no-cycle': ['error', { ignoreExternal: true }],
  'import/no-default-export': 'off', // Very common pattern
  'import/no-dynamic-require': 'error',
  'import/no-empty-named-blocks': 'error',
  'import/no-named-as-default-member': 'off', // Often preferred
  'import/no-named-export': 'off', // Defer to module authors
  'import/no-namespace': 'off', // Sometimes necessary
  'import/no-nodejs-modules': 'off', // Project-specific
  'import/no-relative-parent-imports': 'off', // Too opinionated
  'import/no-self-import': 'error',
  'import/no-webpack-loader-syntax': 'error',
  'import/prefer-default-export': 'off', // Defer to module authors

  'jsdoc/no-defaults': 'error',
  'jsdoc/require-param': 'off', // Overbearing
  'jsdoc/require-param-description': ['error', { setDefaultDestructuredRootDescription: true }],
  'jsdoc/require-param-type': ['error', { setDefaultDestructuredRootType: true }],
  'jsdoc/require-returns': 'off', // Overbearing

  'jsx-a11y/aria-role': ['error', { allowedInvalidRoles: ['text'] }],
  'jsx-a11y/lang': 'error',
  'jsx-a11y/no-aria-hidden-on-focusable': 'error',
  'jsx-a11y/prefer-tag-over-role': 'error',

  'node/no-process-env': 'error',
  'node/no-sync': 'off', // Sometimes simpler is better
  'node/no-top-level-await': 'off', // Supported in modern runtimes

  'oxc/no-async-await': 'off', // Supported modern syntax
  'oxc/no-optional-chaining': 'off', // Supported modern syntax
  'oxc/no-rest-spread-properties': 'off', // Supported modern syntax

  'promise/always-return': [
    'error',
    {
      ignoreAssignmentVariable: ['globalThis', 'window'],
      ignoreLastCallback: true,
    },
  ],
  'promise/avoid-new': 'off', // Common practice
  'promise/no-multiple-resolved': 'error',
  'promise/no-nesting': 'off', // Sometimes necessary
  'promise/no-return-in-finally': 'error', // (Nursery rule)
  'promise/prefer-await-to-then': 'off', // Sometimes clearer to chain

  'react/button-has-type': 'error',
  'react/exhaustive-deps': 'error',
  'react/forbid-component-props': 'off', // Irrelevant
  'react/forward-ref-uses-ref': 'error',
  'react/function-component-definition': [
    'error',
    { namedComponents: 'function-declaration', unnamedComponents: 'arrow-function' },
  ],
  'react/iframe-missing-sandbox': 'error',
  'react/jsx-boolean-value': ['error', 'always'],
  'react/jsx-curly-brace-presence': ['error', { children: 'never', propElementValues: 'always', props: 'never' }],
  'react/jsx-filename-extension': ['error', { extensions: ['jsx', 'tsx'] }],
  'react/jsx-fragments': ['error', 'syntax'],
  'react/jsx-handler-names': [
    'error',
    {
      checkLocalVariables: true,
      eventHandlerPrefix: /(?:handle|set|unset|clear|with)/v.source,
    },
  ],
  'react/jsx-key': [
    'error',
    {
      checkFragmentShorthand: true,
      checkKeyMustBeforeSpread: true,
      warnOnDuplicates: true,
    },
  ],
  'react/jsx-max-depth': 'off', // Too opinionated
  'react/jsx-no-constructed-context-values': 'off', // Obsolete with React Compiler
  'react/jsx-no-literals': 'off', // Project-specific decision
  'react/jsx-no-script-url': 'error',
  'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
  'react/jsx-props-no-spread-multi': 'error',
  'react/jsx-props-no-spreading': 'off', // Very common pattern
  'react/no-array-index-key': 'error',
  'react/no-danger': 'off', // Sometimes necessary
  'react/no-did-mount-set-state': 'error',
  'react/no-multi-comp': 'off', // Defining same-file sub-components is common
  'react/no-namespace': 'error',
  'react/no-object-type-as-default-prop': 'off', // Obsolete with React Compiler
  'react/no-this-in-sfc': 'error',
  'react/no-unknown-property': ['error', { requireDataLowercase: true }],
  'react/no-unsafe': 'error',
  'react/no-will-update-set-state': 'error',
  'react/only-export-components': 'off', // Too opinionated
  'react/react-in-jsx-scope': 'off', // No longer necessary
  'react/state-in-constructor': 'off', // Class components are legacy

  'typescript/ban-types': 'off', // Deprecated in favour of separate rules
  'typescript/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
  'typescript/consistent-type-definitions': ['error', 'interface'],
  'typescript/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: true }],
  'typescript/explicit-function-return-type': [
    'error',
    {
      allowExpressions: true,
      allowFunctionsWithoutTypeParameters: true,
      allowIIFEs: true,
    },
  ],
  'typescript/explicit-member-accessibility': ['error', { overrides: { constructors: 'no-public' } }],
  'typescript/explicit-module-boundary-types': ['error', { allowArgumentsExplicitlyTypedAsAny: true }],
  'typescript/no-deprecated': 'off', // Too opinionated
  'typescript/no-dynamic-delete': 'off', // Sometimes necessary
  'typescript/no-empty-interface': ['error', { allowSingleExtends: true }],
  'typescript/no-empty-object-type': ['error', { allowObjectTypes: 'always' }],
  'typescript/no-extraneous-class': 'off', // Sometimes useful as a pseudo-namespace.
  'typescript/no-inferrable-types': ['error', { ignoreParameters: true }],
  'typescript/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
  'typescript/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
  'typescript/no-unnecessary-type-assertion': 'off', // Too buggy under oxlint.
  'typescript/no-unnecessary-type-parameters': 'off', // Too many false positives
  'typescript/no-unsafe-argument': 'off', // Untyped values are always any in JavaScript
  'typescript/no-unsafe-assignment': 'off', // Untyped values are always any in JavaScript
  'typescript/no-unsafe-call': 'off', // Untyped values are always any in JavaScript
  'typescript/no-unsafe-member-access': 'off', // Untyped values are always any in JavaScript
  'typescript/no-unsafe-return': 'off', // Untyped values are always any in JavaScript
  'typescript/no-unsafe-type-assertion': 'off', // Too buggy under oxlint.
  'typescript/parameter-properties': 'off', // Parameter properties are preferable
  'typescript/prefer-nullish-coalescing': [
    'error',
    { ignoreConditionalTests: false, ignoreMixedLogicalExpressions: false },
  ],
  'typescript/prefer-optional-chain': 'error', // (Nursery rule)
  'typescript/prefer-readonly-parameter-types': 'off', // Not feasible
  'typescript/require-await': 'off', // Flags non-async implementations of required-async interfaces
  'typescript/strict-boolean-expressions': [
    'error',
    {
      allowNullableObject: false,
      allowNullableString: false,
      allowNumber: false,
      allowString: false,
    },
  ],
  'typescript/switch-exhaustiveness-check': [
    'error',
    {
      allowDefaultCaseForExhaustiveSwitch: false,
      considerDefaultExhaustiveForUnions: true,
      requireDefaultForNonUnion: true,
    },
  ],
  'typescript/unbound-method': 'off', // Too many false positives

  'unicorn/consistent-function-scoping': ['error', { checkArrowFunctions: false }],
  'unicorn/empty-brace-spaces': 'off', // Defer to oxfmt
  'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
  'unicorn/max-nested-calls': 'off', // Too opinionated
  'unicorn/no-anonymous-default-export': 'off', // Conflicts with import/no-anonymous-default-export
  'unicorn/no-await-expression-member': 'off', // Sometimes useful
  'unicorn/no-length-as-slice-end': 'off', // Superseded by unicorn/no-unnecessary-slice-end
  'unicorn/no-lonely-if': 'off', // Too opinionated
  'unicorn/no-negated-condition': 'off', // Defer to eslint/no-negated-condition
  'unicorn/no-null': 'off', // Null and undefined distinctions are necessary
  'unicorn/no-process-exit': 'error',
  'unicorn/no-static-only-class': 'off', // Sometimes useful as a pseudo-namespace
  'unicorn/no-this-assignment': 'off', // Sometimes necessary
  'unicorn/no-unreadable-array-destructuring': 'off', // Sometimes useful
  'unicorn/no-useless-iterator-to-array': 'error', // (Nursery rule)
  'unicorn/numeric-separators-style': ['error', { number: { groupLength: 3, minimumDigits: 0 } }],
  'unicorn/prefer-dom-node-text-content': 'off', // 'innerText' and 'textContent' behave differently
  'unicorn/prefer-query-selector': 'off', // Specific accessors can be clearer
  'unicorn/prefer-ternary': 'off', // Sometimes preferable to write explicit if-else
  'unicorn/relative-url-style': ['error', 'always'],
  'unicorn/require-post-message-target-origin': 'error',

  'vite-plus/prefer-vite-plus-imports': 'error',

  'vitest/consistent-each-for': ['error', { describe: 'for', it: 'for', suite: 'for', test: 'for' }],
  'vitest/max-expects': 'off', // Too opinionated
  'vitest/max-nested-describe': 'off', // Too opinionated
  'vitest/no-conditional-expect': 'off', // Too opinionated
  'vitest/no-conditional-in-test': 'off', // Too opinionated
  'vitest/no-conditional-tests': 'off', // Too opinionated
  'vitest/no-disabled-tests': 'off', // Too opinionated
  'vitest/no-hooks': 'off', // Necessary functionality
  'vitest/no-importing-vitest-globals': 'off', // Prefer importing via prefer-importing-vitest-globals
  'vitest/no-large-snapshots': 'off', // Too opinionated
  'vitest/prefer-expect-assertions': [
    'error',
    { onlyFunctionsWithExpectInCallback: true, onlyFunctionsWithExpectInLoop: true },
  ],
  'vitest/prefer-to-be-falsy': 'off', // Prefer strict matchers with prefer-strict-boolean-matchers
  'vitest/prefer-to-be-truthy': 'off', // Prefer strict matchers with prefer-strict-boolean-matchers
  'vitest/require-test-timeout': 'off', // Too much of an edge case
  'vitest/valid-title': ['error', { allowArguments: true }],
  'vitest/warn-todo': 'off', // Too opinionated
} as const satisfies DummyRuleMap;

export const typescript = {
  'jsdoc/require-param-type': 'off', // Irrelevant in TypeScript
  'jsdoc/require-returns-type': 'off', // Irrelevant in TypeScript
  'jsdoc/require-throws-type': 'off', // Irrelevant in TypeScript
  'jsdoc/require-yields-type': 'off', // Irrelevant in TypeScript

  'typescript/no-unsafe-argument': 'error', // (Re-enabling rule disabled in shared)
  'typescript/no-unsafe-assignment': 'error', // (Re-enabling rule disabled in shared)
  'typescript/no-unsafe-call': 'error', // (Re-enabling rule disabled in shared)
  'typescript/no-unsafe-member-access': 'error', // (Re-enabling rule disabled in shared)
  'typescript/no-unsafe-return': 'error', // (Re-enabling rule disabled in shared)

  'unicorn/prefer-includes': 'off', // Defer to typescript/prefer-includes
} as const satisfies DummyRuleMap;

export const typescriptModules = {
  'eslint/no-duplicate-imports': 'off', // Imports within module declarations and outside module declarations behave differently

  'import/no-unassigned-import': 'off', // Necessary for module augmentation
  'import/unambiguous': 'off', // False positives on .d.ts files
} as const satisfies DummyRuleMap;
