/* oxlint-disable no-magic-numbers -- Version numbers read more clearly inline. */

import { describe, expect, it } from 'vite-plus/test';

import { isSupportedVersion } from './swiftFormat.ts';

describe(isSupportedVersion, () => {
  describe('numbered versions', () => {
    it.for([
      ['the minimum itself', '604.0.0', 604, true],
      ['a later major', '700.1.2', 604, true],
      ['an earlier major', '603.0.0', 604, false],
      ['a Swift 5 era version', '0.50700.1', 604, false],
      ['a bare major', '604', 604, true],
      ['a differing minimum', '604.0.0', 700, false],
    ] as const satisfies readonly (readonly [
      label: string,
      version: string,
      minimumMajor: number,
      isSupported: boolean,
    ])[])('compares %s: %s against %s', ([, version, minimumMajor, isSupported]) => {
      expect(isSupportedVersion(version, minimumMajor)).toBe(isSupported);
    });
  });

  describe('unnumbered builds', () => {
    it.for([
      ['a branch build', 'main'],
      ['a development snapshot', 'swift-DEVELOPMENT-SNAPSHOT-2026-09-10-a'],
      ['no output at all', ''],
    ] as const satisfies readonly (readonly [label: string, version: string])[])(
      'assumes %s is current',
      ([, version]) => {
        expect(isSupportedVersion(version, 604)).toBe(true);
      },
    );
  });

  it('ignores surrounding whitespace', () => {
    expect(isSupportedVersion('  604.0.0\n', 604)).toBe(true);
  });
});
