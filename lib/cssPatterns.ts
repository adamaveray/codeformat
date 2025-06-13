/* eslint require-unicode-regexp: 'off' -- Expressions are passed to Stylelint as strings so cannot use any flags in order to match their behaviour. */
export default {
  bem: /^[a-z]+(?:(?:-|--|__)[a-z]+)*$/.source,
  bemWithOptionalSingleUnderscorePrefix: /^_?[a-z]+(?:(?:-|--|__)[a-z]+)*$/.source,
  bemWithOptionalUnderscoresPrefix: /^(?:__)?[a-z]+(?:(?:-|--|__)[a-z]+)*$/.source,
  kebab: /^[a-z]+(?:-[a-z]+)*$/.source,
} satisfies Record<string, string>;
