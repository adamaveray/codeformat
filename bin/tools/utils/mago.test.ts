/* oxlint-disable no-magic-numbers -- Configuration values read more clearly inline. */

import { describe, expect, it } from 'vite-plus/test';

import { buildGlobalArgs, buildScopedConfig } from './mago.ts';

interface ParsedConfig {
  readonly source: Readonly<Record<string, unknown>>;
  readonly [key: string]: unknown;
}

function parseConfig(json: string): ParsedConfig {
  return JSON.parse(json) as ParsedConfig;
}

const dump = JSON.stringify({
  version: '1',
  threads: 12,
  source: {
    workspace: '/project',
    paths: ['.'],
    includes: ['/stubs'],
    excludes: ['vendor/**'],
  },
  linter: { rules: { 'no-empty': true } },
});

describe(buildScopedConfig, () => {
  it('replaces the configured paths', () => {
    const { source } = parseConfig(buildScopedConfig(dump, ['src/a.php', 'src/b.php']));
    expect(source['paths']).toStrictEqual(['src/a.php', 'src/b.php']);
  });

  it('clears the excludes, so a named path is never dropped', () => {
    const { source } = parseConfig(buildScopedConfig(dump, ['vendor/lib.php']));
    expect(source['excludes']).toStrictEqual([]);
  });

  it.for([
    ['the workspace', 'workspace', '/project'],
    ['the includes', 'includes', ['/stubs']],
  ] as const satisfies readonly (readonly [label: string, key: string, expected: unknown])[])(
    'preserves %s',
    ([, key, expected]) => {
      const { source } = parseConfig(buildScopedConfig(dump, ['src/a.php']));
      expect(source[key]).toStrictEqual(expected);
    },
  );

  it('preserves unrelated configuration', () => {
    expect(parseConfig(buildScopedConfig(dump, ['src/a.php']))).toMatchObject({
      version: '1',
      threads: 12,
      linter: { rules: { 'no-empty': true } },
    });
  });

  it('adds a source section to a configuration declaring none', () => {
    const { source } = parseConfig(buildScopedConfig(JSON.stringify({ version: '1' }), ['src/a.php']));
    expect(source).toStrictEqual({ paths: ['src/a.php'], excludes: [] });
  });
});

describe(buildGlobalArgs, () => {
  it('uses the generated configuration when the run is restricted', () => {
    expect(buildGlobalArgs('mago.toml', '/tmp/generated.json')).toStrictEqual(['--config', '/tmp/generated.json']);
  });

  it('falls back to the project configuration', () => {
    expect(buildGlobalArgs('mago.toml')).toStrictEqual(['--config', 'mago.toml']);
  });
});
