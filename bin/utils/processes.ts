import { constants } from 'node:os';

import type { ExitCode } from './types.ts';

export const EXIT_CODE_OK = 0 as const satisfies ExitCode;

/** The offset a signal’s number is added to. */
const signalExitCodeBase = 128;

export function getExitCodeForSignal(signal: NodeJS.Signals): ExitCode {
  return signalExitCodeBase + constants.signals[signal];
}

export function getMostSevereExitCode(a: ExitCode, b: ExitCode): ExitCode {
  if (a === b) {
    return a;
  }

  // Non-OK exit codes take priority
  if (a === EXIT_CODE_OK) {
    return b;
  }
  if (b === EXIT_CODE_OK) {
    return a;
  }

  // Higher exit codes take priority
  return Math.max(a, b);
}
