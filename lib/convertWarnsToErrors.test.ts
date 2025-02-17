import { describe, expect, test } from 'bun:test';

import convertWarnsToErrors from './convertWarnsToErrors.ts';

describe('convertWarnsToErrors', () => {
  test.each(['warn', 1])('converts top-level warnings', (value) => {
    const result = convertWarnsToErrors({ rule1: value });
    expect(result).toEqual({ rule1: 'error' });
  });

  test.each(['warn', 1])('converts nested warnings', (value) => {
    const result = convertWarnsToErrors({ rule1: [value, { foo: 'bar' }] });
    expect(result).toEqual({ rule1: ['error', { foo: 'bar' }] });
  });

  test('ignores other values', () => {
    const result = convertWarnsToErrors({ rule1: 'error', rule2: 'off', rule3: ['off', { foo: 'bar' }] });
    expect(result).toEqual({ rule1: 'error', rule2: 'off', rule3: ['off', { foo: 'bar' }] });
  });
});
