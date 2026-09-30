import { describe, expect, it } from 'vite-plus/test';

import { parseListString } from './strings.ts';

describe(parseListString, () => {
  describe.for([
    ['a null byte', '\0'],
    ['a newline', '\n'],
    ['a comma', ','],
    ['a multi-character separator', ', '],
    ['a regular expression metacharacter', '.'],
  ] as const satisfies readonly (readonly [label: string, separator: string])[])('with %s', ([, separator]) => {
    it.for([
      ['a terminated list', ['a', 'b', ''], ['a', 'b']],
      ['an unterminated list', ['a', 'b'], ['a', 'b']],
      ['a list with empty entries', ['', 'a', '', 'b', ''], ['a', 'b']],
      ['a single entry', ['a'], ['a']],
      ['an empty string', [''], []],
      ['only separators', ['', '', ''], []],
    ] as const satisfies readonly (readonly [label: string, parts: readonly string[], expected: readonly string[]])[])(
      'parses %s',
      ([, parts, expected]) => {
        expect(parseListString(parts.join(separator), separator)).toStrictEqual(expected);
      },
    );
  });

  it.for([
    ['a null byte', 'a\nb\0c', '\0', ['a\nb', 'c']],
    ['a newline', 'a\nb\0c', '\n', ['a', 'b\0c']],
    ['a multi-character separator', 'a,b, c', ', ', ['a,b', 'c']],
  ] as const satisfies readonly (readonly [
    label: string,
    string: string,
    separator: string,
    expected: readonly string[],
  ])[])('splits only on %s', ([, string, separator, expected]) => {
    expect(parseListString(string, separator)).toStrictEqual(expected);
  });
});
