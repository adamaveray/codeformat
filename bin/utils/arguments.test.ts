/* oxlint-disable no-magic-numbers -- Sizes are stated inline so each case shows its own arithmetic. */
import { describe, expect, it } from 'vite-plus/test';

import type { ArgumentEnvironment, LimitsConfiguration } from './arguments.ts';

import { calculateRemainingArgumentBytes, createArgumentBatches } from './arguments.ts';

const plainLimits: LimitsConfiguration = {
  maximumBytes: 100,
  includesEnvironment: true,
  bytesDivisor: 1,
};

/** High enough never to be the limit that applies. */
const noByteLimit = 1_000;
const noCountLimit = 1_000;

/** Duplicated from the source, so a change to its byte counting fails these checks. */
function bytesFor(...values: readonly string[]): number {
  return values.reduce((total, value) => total + Buffer.byteLength(value) + 1, 0);
}

describe(calculateRemainingArgumentBytes, () => {
  it('returns the maximum when there is nothing to subtract', () => {
    expect(calculateRemainingArgumentBytes([], plainLimits, {})).toBe(100);
  });

  describe('fixed arguments', () => {
    it.for([
      ['one argument', ['abc'], 96],
      ['two arguments', ['ab', 'cd'], 94],
      ['an empty argument', [''], 99],
      ['a four-byte character', ['😀'], 95],
    ] as const satisfies readonly (readonly [label: string, fixedArguments: readonly string[], expected: number])[])(
      'subtracts %s',
      ([, fixedArguments, expected]) => {
        expect(calculateRemainingArgumentBytes(fixedArguments, plainLimits, {})).toBe(expected);
      },
    );
  });

  describe('the environment', () => {
    it.for([
      ['one entry', { AB: 'cd' }, 94],
      ['an entry with no value', { AB: undefined }, 96],
      ['two entries', { A: 'b', C: 'd' }, 92],
      ['a four-byte character', { A: '😀' }, 93],
    ] as const satisfies readonly (readonly [label: string, environment: ArgumentEnvironment, expected: number])[])(
      'subtracts %s when environment is included',
      ([, environment, expected]) => {
        expect(calculateRemainingArgumentBytes([], plainLimits, environment)).toBe(expected);
      },
    );

    it('ignores it when environment is excluded', () => {
      const limits = { ...plainLimits, includesEnvironment: false };
      expect(calculateRemainingArgumentBytes([], limits, { AB: 'cd' })).toBe(100);
    });
  });

  describe('the buffer', () => {
    it.for([
      [10, 90],
      [0, 100],
    ] as const satisfies readonly (readonly [buffer: number, expected: number])[])(
      'reserves %i bytes',
      ([buffer, expected]) => {
        expect(calculateRemainingArgumentBytes([], plainLimits, {}, buffer)).toBe(expected);
      },
    );
  });

  describe('the divisor', () => {
    it.for([
      [1, 100],
      [2, 50],
      [4, 25],
    ] as const satisfies readonly (readonly [bytesDivisor: number, expected: number])[])(
      'divides by %i',
      ([bytesDivisor, expected]) => {
        expect(calculateRemainingArgumentBytes([], { ...plainLimits, bytesDivisor }, {})).toBe(expected);
      },
    );

    it('rounds down', () => {
      expect(calculateRemainingArgumentBytes([''], { ...plainLimits, bytesDivisor: 2 }, {})).toBe(
        49, // 99 halved
      );
    });
  });

  it('subtracts every cost before dividing', () => {
    expect(calculateRemainingArgumentBytes(['abc'], { ...plainLimits, bytesDivisor: 2 }, { AB: 'cd' }, 10)).toBe(
      40, // 100 less 4, 6 & 10
    );
  });

  describe('costs above the maximum', () => {
    it.for([
      ['fixed arguments', ['x'.repeat(200)], {}, 0],
      ['an environment', [], { BIG: 'x'.repeat(200) }, 0],
      ['a buffer', [], {}, 200],
    ] as const satisfies readonly (readonly [
      label: string,
      fixedArguments: readonly string[],
      environment: ArgumentEnvironment,
      buffer: number,
    ])[])('returns a negative number for %s', ([, fixedArguments, environment, buffer]) => {
      expect(calculateRemainingArgumentBytes(fixedArguments, plainLimits, environment, buffer)).toBeLessThan(0);
    });
  });
});

describe(createArgumentBatches, () => {
  const values = [
    'a.x',
    'b.x',
    '😀', // 4-byte character
    'a-much-longer-value', // Long string
    'c.x',
    'd.x',
    'e.x',
  ] satisfies string[];

  const limitCases = [
    ['no limits', { maxBytes: noByteLimit, maxCount: noCountLimit }],
    ['a byte limit of two values', { maxBytes: bytesFor('a.x', 'b.x'), maxCount: noCountLimit }],
    ['a count of two', { maxBytes: noByteLimit, maxCount: 2 }],
    ['both limits at two values', { maxBytes: bytesFor('a.x', 'b.x'), maxCount: 2 }],
    ['a byte limit of zero', { maxBytes: 0, maxCount: noCountLimit }],
    ['negative limits', { maxBytes: -1, maxCount: 0 }],
  ] as const satisfies readonly (readonly [
    label: string,
    limits: { readonly maxBytes: number; readonly maxCount: number },
  ])[];

  describe.for(limitCases)('given %s', ([, { maxBytes, maxCount }]) => {
    const divide = (): readonly (readonly string[])[] => [...createArgumentBatches(values, maxBytes, maxCount)];

    it('keeps every value in the order given', () => {
      expect(divide().flat()).toStrictEqual(values);
    });

    it('does not yield an empty batch', () => {
      expect(divide().filter((batch) => batch.length === 0)).toStrictEqual([]);
    });

    it('fits each batch within the byte limit', () => {
      // A single value too large for any batch is the one exception
      expect(divide().filter((batch) => batch.length > 1 && bytesFor(...batch) > maxBytes)).toStrictEqual([]);
    });

    it('fits each batch within the count', () => {
      expect(divide().filter((batch) => batch.length > 1 && batch.length > maxCount)).toStrictEqual([]);
    });
  });

  describe('boundaries', () => {
    it.for([
      [
        'values under both limits',
        {
          values: ['a.x', 'b.x', 'c.x'],
          maxBytes: noByteLimit,
          maxCount: noCountLimit,
          expected: [['a.x', 'b.x', 'c.x']],
        },
      ],
      [
        'values that exactly fill the byte limit',
        {
          values: ['a.x', 'b.x'],
          maxBytes: bytesFor('a.x', 'b.x'),
          maxCount: noCountLimit,
          expected: [['a.x', 'b.x']],
        },
      ],
      [
        'a byte limit one short of both values',
        {
          values: ['a.x', 'b.x'],
          maxBytes: bytesFor('a.x', 'b.x') - 1,
          maxCount: noCountLimit,
          expected: [['a.x'], ['b.x']],
        },
      ],
      [
        'values that exactly reach the count',
        { values: ['a.x', 'b.x', 'c.x'], maxBytes: noByteLimit, maxCount: 3, expected: [['a.x', 'b.x', 'c.x']] },
      ],
      [
        'a count one short of every value',
        { values: ['a.x', 'b.x', 'c.x'], maxBytes: noByteLimit, maxCount: 2, expected: [['a.x', 'b.x'], ['c.x']] },
      ],
      [
        'a four-byte character',
        {
          values: ['😀', 'b.x'],
          maxBytes: bytesFor('😀', 'b.x') - 1,
          maxCount: noCountLimit,
          expected: [['😀'], ['b.x']],
        },
      ],
      [
        'a value larger than the byte limit',
        {
          values: ['a.x', 'a-much-longer-value', 'b.x'],
          maxBytes: bytesFor('a.x'),
          maxCount: noCountLimit,
          expected: [['a.x'], ['a-much-longer-value'], ['b.x']],
        },
      ],
      [
        'a byte limit of zero',
        { values: ['a.x', 'b.x', 'c.x'], maxBytes: 0, maxCount: noCountLimit, expected: [['a.x'], ['b.x'], ['c.x']] },
      ],
    ] as const satisfies readonly (readonly [
      label: string,
      testCase: {
        readonly values: readonly string[];
        readonly maxBytes: number;
        readonly maxCount: number;
        readonly expected: readonly (readonly string[])[];
      },
    ])[])('divides %s', ([, { values: batchValues, maxBytes, maxCount, expected }]) => {
      expect([...createArgumentBatches(batchValues, maxBytes, maxCount)]).toStrictEqual(expected);
    });
  });

  it('yields nothing for no values', () => {
    expect([...createArgumentBatches([], noByteLimit, noCountLimit)]).toStrictEqual([]);
  });
});
