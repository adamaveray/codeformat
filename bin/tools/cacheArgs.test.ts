import { describe, expect, it } from 'vite-plus/test';

import type { Tool } from '../utils/types.ts';

import knip from './knip.ts';
import phpCsFixer from './phpCsFixer.ts';

describe('cache arguments', () => {
  it.for([
    ['knip', knip, '/cache/knip', ['--cache', '--cache-location', '/cache/knip']],
    ['knip', knip, undefined, []],
    ['phpCsFixer', phpCsFixer, '/cache/phpCsFixer', ['--cache-file', '/cache/phpCsFixer/.php-cs-fixer.cache']],
    ['phpCsFixer', phpCsFixer, undefined, ['--using-cache=no']],
  ] as const satisfies readonly (readonly [
    label: string,
    tool: Tool,
    cacheDir: string | undefined,
    expected: readonly string[],
  ])[])('builds %s arguments for cache directory %s', ([, tool, cacheDir, expected]) => {
    expect(tool.args.cache(cacheDir)).toStrictEqual(expected);
  });
});
