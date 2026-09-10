const patterns = {
  bem: /^[a-z]+(?:(?:-|--|__)[a-z]+)*$/v.source,
  bemWithOptionalSingleUnderscorePrefix: /^_?[a-z]+(?:(?:-|--|__)[a-z]+)*$/v.source,
  bemWithOptionalUnderscoresPrefix: /^(?:__)?[a-z]+(?:(?:-|--|__)[a-z]+)*$/v.source,
  kebab: /^[a-z]+(?:-[a-z]+)*$/v.source,
} as const satisfies Record<string, string>;

export function patternOrScssInterpolation(pattern: string): string {
  // Remove anchors
  if (!pattern.startsWith('^') || !pattern.endsWith('$')) {
    throw new Error('Pattern must use both start & end anchors.');
  }

  const innerPattern = pattern.slice(1, -1);
  return /^(?:#\{[^\}]+\}|__inner__)$/v.source.replace('__inner__', innerPattern);
}

export default patterns;
