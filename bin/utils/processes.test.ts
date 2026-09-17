/* oxlint-disable no-magic-numbers -- Exit codes are stated inline. */
import { constants } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import { getExitCodeForSignal } from './processes.ts';

describe(getExitCodeForSignal, () => {
  // Only signals carrying the same number on every platform
  it.for(Object.entries(constants.signals) as readonly (readonly [signal: NodeJS.Signals, value: number])[])(
    'adds 128 to the number for %s',
    ([signal, value]) => {
      expect(getExitCodeForSignal(signal)).toBe(value + 128);
    },
  );
});
