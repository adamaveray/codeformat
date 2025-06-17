/* eslint require-unicode-regexp: 'off' -- Expressions are passed to Stylelint as strings so cannot use any flags in order to match their behaviour. */

const patterns = {
  bem: /^[a-z]+(?:(?:-|--|__)[a-z]+)*$/.source,
  bemWithOptionalSingleUnderscorePrefix: /^_?[a-z]+(?:(?:-|--|__)[a-z]+)*$/.source,
  bemWithOptionalUnderscoresPrefix: /^(?:__)?[a-z]+(?:(?:-|--|__)[a-z]+)*$/.source,
  kebab: /^[a-z]+(?:-[a-z]+)*$/.source,
} as const satisfies Record<string, string>;

export function patternOrScssInterpolation(pattern: string): string {
  // Remove anchors
  if (!pattern.startsWith('^') || !pattern.endsWith('$')) {
    throw new Error('Pattern must use both start & end anchors.');
  }
  pattern = pattern.slice(1, -1);

  return new RegExp(`^(?:#{[^}]+}|${pattern})$`).source;
}

export default patterns;
