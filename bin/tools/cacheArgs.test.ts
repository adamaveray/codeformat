import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, onTestFinished } from 'vite-plus/test';

import type { Tool, ToolActionContext } from '../utils/types.ts';

import knip from './knip.ts';
import phpCsFixer from './phpCsFixer.ts';

function makeProject(): { writeConfig: (configPath: string, contents: string) => ToolActionContext } {
  const rootPath = mkdtempSync(path.join(tmpdir(), 'codeformat-cache-args-'));
  onTestFinished(() => {
    rmSync(rootPath, { recursive: true });
  });
  return {
    writeConfig: (configPath, contents) => {
      writeFileSync(path.join(rootPath, configPath), contents);
      return { rootPath, configPath, supportedExtensions: [] };
    },
  };
}

describe('cache arguments', () => {
  const context: ToolActionContext = { rootPath: '/project', configPath: 'config', supportedExtensions: [] };

  it.for([
    ['knip', knip, undefined, []],
    ['phpCsFixer', phpCsFixer, '/cache/phpCsFixer', ['--cache-file', '/cache/phpCsFixer/.php-cs-fixer.cache']],
    ['phpCsFixer', phpCsFixer, undefined, ['--using-cache=no']],
  ] as const satisfies readonly (readonly [
    label: string,
    tool: Tool,
    cacheDir: string | undefined,
    expected: readonly string[],
  ])[])('builds %s arguments for cache directory %s', ([, tool, cacheDir, expected]) => {
    expect(tool.args.cache(cacheDir, context)).toStrictEqual(expected);
  });

  it.for([
    ['knip.config.ts', /^\/cache\/knip\/knip\.config\.[\da-f]{16}\.ts$/v],
    ['.knip.json', /^\/cache\/knip\/\.knip\.[\da-f]{16}\.json$/v],
  ] as const)('names the knip cache location after %s', ([configPath, expected]) => {
    const { writeConfig } = makeProject();

    expect(knip.args.cache('/cache/knip', writeConfig(configPath, '{}'))).toStrictEqual([
      '--cache',
      '--cache-location',
      expect.stringMatching(expected),
    ]);
  });

  it('changes the knip cache location when the config changes', () => {
    const { writeConfig } = makeProject();
    const original = knip.args.cache('/cache/knip', writeConfig('knip.json', '{}'));
    const changed = knip.args.cache('/cache/knip', writeConfig('knip.json', '{ "entry": [] }'));

    expect(changed).not.toStrictEqual(original);
  });
});
