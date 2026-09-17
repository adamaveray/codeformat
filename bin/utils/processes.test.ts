/* oxlint-disable no-magic-numbers -- Exit codes are stated inline. */
import { constants } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import type { ExitCode } from './types.ts';

import { EXIT_CODE_OK, getExitCodeForSignal, getMostSevereExitCode } from './processes.ts';

describe(getExitCodeForSignal, () => {
  // Only signals carrying the same number on every platform
  it.for(Object.entries(constants.signals) as readonly (readonly [signal: NodeJS.Signals, value: number])[])(
    'adds 128 to the number for %s',
    ([signal, value]) => {
      expect(getExitCodeForSignal(signal)).toBe(value + 128);
    },
  );
});

describe(getMostSevereExitCode, () => {
  it.for([0, 1, 130] as const satisfies readonly ExitCode[])('returns %i when given it twice', (code) => {
    expect(getMostSevereExitCode(code, code)).toBe(code);
  });

  it.for([1, 130, 255] as const satisfies readonly ExitCode[])('prefers %i over "ok"', (failure) => {
    expect(getMostSevereExitCode(failure, EXIT_CODE_OK)).toBe(failure);
    expect(getMostSevereExitCode(EXIT_CODE_OK, failure)).toBe(failure);
  });

  it.for([
    [2, 1],
    [130, 1],
    [255, 2],
  ] as const satisfies readonly (readonly [higher: ExitCode, lower: ExitCode])[])(
    'prefers %i over %i',
    ([higher, lower]) => {
      expect(getMostSevereExitCode(higher, lower)).toBe(higher);
      expect(getMostSevereExitCode(lower, higher)).toBe(higher);
    },
  );
});
