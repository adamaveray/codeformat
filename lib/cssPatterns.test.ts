import { describe, expect, test } from 'bun:test';

import patterns from './cssPatterns.ts';

type PatternName = keyof typeof patterns;
type PatternsMap<T = any> = Record<PatternName, T>;

const strings = {
  camelCase: 'helloWorld',
  kebabCase: 'hello-world',
  bemUnderscored: 'hello-world__this-is__a-selector',
  bemHyphened: 'hello-world--this-is--a-selector',
  bemMixed: 'hello-world__this-is--a-selector',
  bemPrefixedUnderscores: '__hello-world__this-is__a-selector',
  bemPrefixedSingleUnderscore: '_hello-world__this-is__a-selector',
  bemPrefixedHyphens: '--hello-world__this-is__a-selector',
  bemPrefixedSingleHyphen: '-hello-world__this-is__a-selector',
};

const testSets = {
  bem: {
    valid: [strings.kebabCase, strings.bemUnderscored, strings.bemHyphened, strings.bemMixed],
    invalid: [
      strings.camelCase,
      strings.bemPrefixedUnderscores,
      strings.bemPrefixedSingleUnderscore,
      strings.bemPrefixedHyphens,
      strings.bemPrefixedSingleHyphen,
    ],
  },
  bemWithOptionalSingleUnderscorePrefix: {
    valid: [
      strings.kebabCase,
      strings.bemUnderscored,
      strings.bemHyphened,
      strings.bemMixed,
      strings.bemPrefixedSingleUnderscore,
    ],
    invalid: [
      strings.camelCase,
      strings.bemPrefixedUnderscores,
      strings.bemPrefixedHyphens,
      strings.bemPrefixedSingleHyphen,
    ],
  },
  bemWithOptionalUnderscoresPrefix: {
    valid: [
      strings.kebabCase,
      strings.bemUnderscored,
      strings.bemHyphened,
      strings.bemMixed,
      strings.bemPrefixedUnderscores,
    ],
    invalid: [
      strings.camelCase,
      strings.bemPrefixedSingleUnderscore,
      strings.bemPrefixedHyphens,
      strings.bemPrefixedSingleHyphen,
    ],
  },
  kebab: {
    valid: [strings.kebabCase],
    invalid: [
      strings.camelCase,
      strings.bemUnderscored,
      strings.bemHyphened,
      strings.bemMixed,
      strings.bemPrefixedUnderscores,
      strings.bemPrefixedSingleUnderscore,
      strings.bemPrefixedHyphens,
      strings.bemPrefixedSingleHyphen,
    ],
  },
} as const satisfies PatternsMap<{ valid: string[]; invalid: string[] }>;

describe('patterns', () => {
  for (const [patternName, { valid, invalid }] of Object.entries(testSets)) {
    // eslint-disable-next-line require-unicode-regexp -- Expressions are passed to Stylelint as strings so cannot use any flags in order to match their behaviour.
    const pattern = new RegExp(patterns[patternName as keyof typeof patterns]);
    test.each(valid)(`"${patternName}" matches correct strings`, (string) => {
      expect(string).toMatch(pattern);
    });
    test.each(invalid)(`"${patternName}" does not match incorrect strings`, (string) => {
      expect(string).not.toMatch(pattern);
    });
  }
});
