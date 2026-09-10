import { describe, expect, it } from 'vite-plus/test';

import patterns from './cssPatterns.ts';

type PatternName = keyof typeof patterns;
type PatternsMap<T = unknown> = Record<PatternName, T>;

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

describe('css patterns', () => {
  describe.for(Object.entries(testSets))('%s', ([patternName, { valid, invalid }]) => {
    const pattern = new RegExp(patterns[patternName as keyof typeof patterns], 'v');

    it.for(valid)('matches correct string %s', (string) => {
      expect(string).toMatch(pattern);
    });

    it.for(invalid)('does not match incorrect string %s', (string) => {
      expect(string).not.toMatch(pattern);
    });
  });
});
