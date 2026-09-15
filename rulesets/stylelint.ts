import type { Config } from 'stylelint';

import propertiesOrder from '@averay/css-properties-sort-order';
import recommendedCss from 'stylelint-config-recommended';
import recommendedScss from 'stylelint-config-recommended-scss';
import standardCss from 'stylelint-config-standard';
import standardScss from 'stylelint-config-standard-scss';
import defensiveCssStrict from 'stylelint-plugin-defensive-css/configs/strict';

import patterns, { patternOrScssInterpolation } from '../lib/cssPatterns.ts';

type ConfigRules = NonNullable<Config['rules']>;

export const css: ConfigRules = {
  ...recommendedCss.rules,
  ...standardCss.rules,

  // Disable oxfmt conflicts
  ...{
    'declaration-block-single-line-max-declarations': null,
    'selector-attribute-quotes': null,
  },

  // Core rules
  ...{
    'at-rule-property-required-list': {
      'font-face': ['font-display', 'font-family', 'font-style', 'font-weight', 'src'],
      property: ['inherits', 'initial-value', 'syntax'],
    },
    'color-hex-alpha': 'never',
    'color-named': 'never',
    'color-no-hex': null, // Hex values are very standard
    'declaration-no-important': null, // Sometimes necessary
    'display-notation': 'full',
    'font-weight-notation': 'numeric',
    'function-url-no-scheme-relative': true,
    'function-url-scheme-allowed-list': ['data', 'https'],
    'property-layout-mappings': 'flow-relative',
    'relative-selector-nesting-notation': 'explicit',
    'selector-disallowed-list': [[/^html\b/v], { splitList: true }], // Encourage :root over html
    'selector-no-deprecated': true,
    'selector-no-invalid': true,
    'selector-no-unmatchable': true,
    'unit-disallowed-list': [
      ...['dpi', 'in', 'pc', 'pt', 'q'], // Enforce millimetres over US customary units
      ...['cm', 'dpcm'], // Enforce millimetres over cm
      ...['s'], // Enforce milliseconds over seconds
    ],
    'unit-layout-mappings': 'flow-relative',
    'value-keyword-layout-mappings': 'flow-relative',
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
  ...defensiveCssStrict.rules,
  'defensive-css/no-accidental-hover': null, // Overbearing and disallows combining with `:focus-visible`.
  'defensive-css/no-fixed-sizes': null, // Sometimes 1px is necessary.
  'defensive-css/require-at-layer': null, // Too opinionated.
  'defensive-css/require-custom-property-fallback': null, // Makes using custom properties too burdensome.
  'defensive-css/require-flex-wrap': null, // Not wrapping is the default for a reason.
  'defensive-css/require-named-grid-lines': null, // Too noisy for even the simplest grid layout.
  'defensive-css/require-prefers-reduced-motion': null, // "Reduce" motion does not mean "no" motion.
  'defensive-css/require-pure-selectors': null, // Too opinionated.
  'defensive-css/require-scrollbar-gutter': null, // Ruins the aesthetic to accommodate edge cases.

  'order/order': ['custom-properties', 'declarations'],
  'order/properties-order': [propertiesOrder, { unspecified: 'bottomAlphabetical' }],
};

export const scss: ConfigRules = {
  ...recommendedScss.rules,
  ...standardScss.rules,

  // Disable incompatible rules
  ...{
    'function-no-unknown': null,
    'selector-no-invalid': null,
    'selector-no-unmatchable': null,
  },

  // Replace core rules with SCSS-aware equivalents
  ...{
    ...{
      'property-no-unknown': null,
      'scss/property-no-unknown': true,
    },
    ...{
      'color-no-invalid-hex': null,
      'function-linear-gradient-no-nonstandard-direction': null,
      'scss/declaration-property-value-no-unknown': true,
    },
  },

  // Disable oxfmt conflicts
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
  },

  // Naming patterns
  ...{
    'scss/at-function-pattern': patterns.bemWithOptionalSingleUnderscorePrefix,
    'scss/at-mixin-pattern': patterns.bemWithOptionalSingleUnderscorePrefix,
    'scss/dollar-variable-pattern': patterns.bemWithOptionalSingleUnderscorePrefix,
    'scss/percent-placeholder-pattern': patterns.bemWithOptionalSingleUnderscorePrefix,
  },

  // Support interpolation for @ keywords
  ...{
    'container-name-pattern': patternOrScssInterpolation(patterns.bem),
    'custom-media-pattern': patternOrScssInterpolation(patterns.bem),
    'custom-property-pattern': patternOrScssInterpolation(patterns.bem),
    'keyframes-name-pattern': patternOrScssInterpolation(patterns.bem),
    'layer-name-pattern': patternOrScssInterpolation(patterns.bem),
  },

  // Further customisations
  ...{
    'nesting-selector-no-missing-scoping-root': [true, { ignoreAtRules: ['mixin', 'include'] }],
    'scss/at-each-key-value-single-line': true,
    'scss/at-if-no-null': null, // Allow explicitly distinguishing between null & falsely
    'scss/at-mixin-named-arguments': ['always', { ignore: ['single-argument'] }],
    'scss/at-root-no-redundant': true,
    'scss/at-use-no-redundant-alias': true,
    'scss/dimension-no-non-numeric-values': true,
    'scss/dollar-variable-empty-line-after': [
      'always',
      { except: ['last-nested', 'before-dollar-variable'], ignore: ['before-comment'] },
    ],
    'scss/dollar-variable-no-namespaced-assignment': true,
    'scss/function-calculation-no-interpolation': true,
    'scss/function-color-channel': true,
    'scss/function-color-relative': true,
    'scss/function-no-unknown': null, // Flags custom functions
    'scss/map-keys-quotes': 'always',
    'scss/media-feature-value-dollar-variable': ['always', { ignore: ['keywords'] }],
    'scss/no-duplicate-dollar-variables': [true, { ignoreDefaults: false }],
    'scss/no-duplicate-load-rules': true,
    'scss/no-unused-private-members': true,
  },
};

export const embeddedScss: ConfigRules = {
  'no-invalid-position-declaration': null, // Incompatible with inline `style` attribute styles
};

export default { css, embeddedScss, scss };
