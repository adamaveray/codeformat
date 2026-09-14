/* oxlint-disable vitest/require-hook -- Global extension file. */

import type { Matcher } from 'vite-plus/test';

import { expect } from 'vite-plus/test';

import type { IgnoreFilters, IgnoreSource } from './bin/utils/ignores.ts';

import { createIgnoreFilters } from './bin/utils/ignores.ts';

type PatternsValue = IgnoreSource | IgnoreSource['patterns'];

declare module 'vite-plus/test' {
  // oxlint-disable-next-line typescript/no-explicit-any -- Must match vitest's `Matchers<T = any>` declaration
  interface Matchers<T = any> {
    toMatchFilePath: T extends PatternsValue ? (relativePath: string) => void : never;
    toMatchDirectoryPath: T extends PatternsValue ? (relativePath: string) => void : never;
  }
}

function buildMessage(template: string, params: Record<string, unknown>): string {
  return template.replace(/\{(?<tokenName>\w+)\}/v, (_match, tokenName: string) =>
    JSON.stringify(params[tokenName] ?? undefined),
  );
}

const buildExpectMatch = (type: keyof IgnoreFilters): Matcher => {
  return function expectMatchPath(value: PatternsValue, relativePath: string) {
    const patterns = 'patterns' in value ? value.patterns : value;
    const isMatch = createIgnoreFilters(patterns)[type];

    return {
      pass: isMatch(relativePath),
      message: () =>
        buildMessage(`expected {patterns} ${this.isNot ? 'not to' : 'to'} match ${type} path {relativePath}`, {
          patterns,
          relativePath,
        }),
    };
  };
};

expect.extend({
  toMatchFilePath: buildExpectMatch('file'),
  toMatchDirectoryPath: buildExpectMatch('directory'),
});
