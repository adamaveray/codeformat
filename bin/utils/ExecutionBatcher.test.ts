/* oxlint-disable no-magic-numbers -- Sizes are stated inline so each case shows its own arithmetic. */
import { describe, expect, it } from 'vite-plus/test';

import type { ArgumentEnvironment, LimitsConfiguration } from './arguments.ts';
import type { NonEmptyArray } from './types.ts';

import ExecutionBatcher from './ExecutionBatcher.ts';

interface Construction {
  readonly command: NonEmptyArray<string>;
  readonly environment: ArgumentEnvironment;
  readonly limits: LimitsConfiguration;
  readonly maximumBatchArguments: number;
  readonly bytesBuffer: number;
  readonly values: readonly string[];
  readonly expected: readonly (readonly string[])[];
}

describe(ExecutionBatcher, () => {
  it.for([
    [
      'the command, leaving 6 of 8 bytes',
      {
        command: ['c'],
        environment: {},
        limits: { maximumBytes: 8, includesEnvironment: true, bytesDivisor: 1 },
        maximumBatchArguments: 100,
        bytesBuffer: 0,
        values: ['a', 'b', 'c'],
        expected: [['a', 'b', 'c']],
      },
    ],
    [
      'a longer command, leaving 4 of 13 bytes',
      {
        command: ['c', '--flag'],
        environment: {},
        limits: { maximumBytes: 13, includesEnvironment: true, bytesDivisor: 1 },
        maximumBatchArguments: 100,
        bytesBuffer: 0,
        values: ['a', 'b', 'c'],
        expected: [['a', 'b'], ['c']],
      },
    ],
    [
      'the environment, leaving 4 of 10 bytes',
      {
        command: ['c'],
        environment: { E: 'v' },
        limits: { maximumBytes: 10, includesEnvironment: true, bytesDivisor: 1 },
        maximumBatchArguments: 100,
        bytesBuffer: 0,
        values: ['a', 'b', 'c'],
        expected: [['a', 'b'], ['c']],
      },
    ],
    [
      'an environment the limits exclude, leaving 8 of 10 bytes',
      {
        command: ['c'],
        environment: { E: 'v' },
        limits: { maximumBytes: 10, includesEnvironment: false, bytesDivisor: 1 },
        maximumBatchArguments: 100,
        bytesBuffer: 0,
        values: ['a', 'b', 'c'],
        expected: [['a', 'b', 'c']],
      },
    ],
    [
      'the buffer, leaving 4 of 8 bytes',
      {
        command: ['c'],
        environment: {},
        limits: { maximumBytes: 8, includesEnvironment: true, bytesDivisor: 1 },
        maximumBatchArguments: 100,
        bytesBuffer: 2,
        values: ['a', 'b', 'c'],
        expected: [['a', 'b'], ['c']],
      },
    ],
    [
      'the divisor, leaving 4 of 10 bytes',
      {
        command: ['c'],
        environment: {},
        limits: { maximumBytes: 10, includesEnvironment: true, bytesDivisor: 2 },
        maximumBatchArguments: 100,
        bytesBuffer: 0,
        values: ['a', 'b', 'c'],
        expected: [['a', 'b'], ['c']],
      },
    ],
    [
      'the maximum argument count, with bytes to spare',
      {
        command: ['c'],
        environment: {},
        limits: { maximumBytes: 100, includesEnvironment: true, bytesDivisor: 1 },
        maximumBatchArguments: 2,
        bytesBuffer: 0,
        values: ['a', 'b', 'c'],
        expected: [['a', 'b'], ['c']],
      },
    ],
  ] satisfies readonly (readonly [label: string, construction: Construction])[])(
    'accounts for %s',
    ([, { command, environment, limits, maximumBatchArguments, bytesBuffer, values, expected }]) => {
      const batcher = new ExecutionBatcher(command, environment, limits, maximumBatchArguments, bytesBuffer);

      expect(batcher).toBatchIntoValues(values, (batchValues) => batchValues, expected);
    },
  );

  it('applies the transformer, numbering each batch', () => {
    const batcher = new ExecutionBatcher(
      ['c'],
      {},
      { maximumBytes: 100, includesEnvironment: true, bytesDivisor: 1 },
      2,
    );

    expect(batcher).toBatchInto(['a', 'b', 'c'], (batchValues) => batchValues.join('+'), [
      { index: 0, values: 'a+b', totalBatches: 2 },
      { index: 1, values: 'c', totalBatches: 2 },
    ]);
  });

  it('renumbers around a batch the transformer drops', () => {
    const batcher = new ExecutionBatcher(
      ['c'],
      {},
      { maximumBytes: 100, includesEnvironment: true, bytesDivisor: 1 },
      1,
    );

    expect(batcher).toBatchInto(
      ['a', 'b', 'c'],
      (batchValues) => (batchValues[0] === 'b' ? undefined : batchValues.join('')),
      [
        { index: 0, values: 'a', totalBatches: 2 },
        { index: 1, values: 'c', totalBatches: 2 },
      ],
    );
  });

  it('yields nothing for no values', () => {
    const batcher = new ExecutionBatcher(
      ['c'],
      {},
      { maximumBytes: 100, includesEnvironment: true, bytesDivisor: 1 },
      100,
    );

    expect(batcher).toBatchIntoValues([], (batchValues) => batchValues, []);
  });
});
