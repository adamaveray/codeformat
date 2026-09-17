/* oxlint-disable vitest/require-hook -- Global extension file. */

import type { Matcher } from 'vite-plus/test';

import { expect } from 'vite-plus/test';

import type ExecutionBatcher from './bin/utils/ExecutionBatcher.ts';
import type { Batch } from './bin/utils/ExecutionBatcher.ts';
import type { IgnoreFilters, IgnoreSource } from './bin/utils/ignores.ts';
import type { PathContext, ResolvedPaths } from './bin/utils/paths.ts';

import { createIgnoreFilters } from './bin/utils/ignores.ts';
import { expandPath, FileError, resolvePaths } from './bin/utils/paths.ts';

type PatternsValue = IgnoreSource | IgnoreSource['patterns'];

/** Maps one batch's values to whatever a caller passes on to its process. */
type BatchTransformer<T> = (batchValues: readonly string[]) => T | undefined;

type FileErrorClass = new (filePath: string) => FileError;

/** A test applied to a single file path. */
type PathTest = (filePath: string) => boolean;

/** The root to resolve paths within, and the patterns to walk it under. */
interface TestPathContext {
  readonly rootPath: string;
  readonly ignorePatterns?: readonly string[];
}

declare module 'vite-plus/test' {
  // oxlint-disable-next-line typescript/no-explicit-any -- Must match vitest's `Matchers<T = any>` declaration
  interface Matchers<T = any> {
    toMatchFilePath: T extends PatternsValue ? (relativePath: string) => void : never;
    toMatchDirectoryPath: T extends PatternsValue ? (relativePath: string) => void : never;

    toExpandInPathContextTo: T extends string
      ? (expectedFiles: readonly string[], context: TestPathContext) => void
      : never;
    toResolveInPathContextTo: T extends readonly string[]
      ? (expected: ResolvedPaths, context: TestPathContext) => void
      : never;
    toBeRejectedInPathContextWith: T extends string
      ? (expectedError: FileErrorClass, context: TestPathContext) => void
      : never;

    toMatchAsTest: T extends PathTest ? (filePath: string) => void : never;

    toBatchInto: T extends ExecutionBatcher
      ? <TValue>(
          values: readonly string[],
          transformer: BatchTransformer<TValue>,
          expectedBatches: readonly Batch<TValue>[],
        ) => void
      : never;
    toBatchIntoValues: T extends ExecutionBatcher
      ? <TValue>(
          values: readonly string[],
          transformer: BatchTransformer<TValue>,
          expectedBatchValues: readonly TValue[],
        ) => void
      : never;
  }
}

function buildMessage(template: string, params: Record<string, unknown>): string {
  return template.replaceAll(/\{(?<tokenName>\w+)\}/gv, (_match, tokenName: string) =>
    JSON.stringify(params[tokenName] ?? undefined),
  );
}

const buildPathContext = ({ rootPath, ignorePatterns = [] }: TestPathContext): PathContext => ({
  rootPath,
  ignoreFilters: createIgnoreFilters(ignorePatterns),
});

const describeContext = ({ ignorePatterns }: TestPathContext): string =>
  ignorePatterns == null || ignorePatterns.length === 0
    ? 'no ignore patterns'
    : buildMessage('ignore patterns {ignorePatterns}', { ignorePatterns });

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

  toExpandInPathContextTo(pathName: string, expectedFiles: readonly string[], context: TestPathContext) {
    const actual = expandPath(pathName, buildPathContext(context));

    return {
      pass: this.equals(actual, expectedFiles),
      expected: expectedFiles,
      actual,
      message: () =>
        buildMessage(
          `expected {pathName} under ${describeContext(context)} ${this.isNot ? 'not to' : 'to'} expand to the expected files`,
          { pathName },
        ),
    };
  },

  toResolveInPathContextTo(pathNames: readonly string[], expected: ResolvedPaths, context: TestPathContext) {
    const actual = resolvePaths(pathNames, buildPathContext(context));

    return {
      pass: this.equals(actual, expected),
      expected,
      actual,
      message: () =>
        buildMessage(
          `expected {pathNames} under ${describeContext(context)} ${this.isNot ? 'not to' : 'to'} resolve to the expected paths`,
          { pathNames, expected },
        ),
    };
  },

  toBeRejectedInPathContextWith(pathName: string, expectedError: FileErrorClass, context: TestPathContext) {
    let caught: unknown;
    try {
      expandPath(pathName, buildPathContext(context));

      // Did not throw - failure
      return {
        pass: false,
        expected: expectedError.name,
        actual: undefined,
        message: () =>
          buildMessage(
            `expected {pathName} under ${describeContext(context)} ${this.isNot ? 'not to' : 'to'} be rejected`,
            { pathName },
          ),
      };
    } catch (error) {
      caught = error;
    }

    const actual = caught instanceof FileError ? { name: caught.name, filePath: caught.filePath } : caught;

    return {
      pass: caught instanceof expectedError && caught.filePath === pathName,
      expected: { name: expectedError.name, filePath: pathName },
      actual,
      message: () =>
        buildMessage(
          `expected {pathName} under ${describeContext(context)} ${this.isNot ? 'not to' : 'to'} be rejected with {expected}`,
          {
            pathName,
            expected: expectedError.name,
          },
        ),
    };
  },

  toMatchAsTest(pathTest: PathTest, filePath: string) {
    return {
      pass: pathTest(filePath),
      message: () => buildMessage(`expected the test ${this.isNot ? 'not to' : 'to'} match {filePath}`, { filePath }),
    };
  },

  toBatchInto<TValue>(
    batcher: ExecutionBatcher,
    values: readonly string[],
    transformer: BatchTransformer<TValue>,
    expectedBatches: readonly Batch<TValue>[],
  ) {
    const actual = [...batcher.batch(values, transformer)];

    return {
      pass: this.equals(actual, expectedBatches),
      expected: expectedBatches,
      actual,
      message: () =>
        buildMessage(`expected {values} ${this.isNot ? 'not to' : 'to'} batch into the expected batches`, { values }),
    };
  },

  toBatchIntoValues<TValue>(
    batcher: ExecutionBatcher,
    values: readonly string[],
    transformer: BatchTransformer<TValue>,
    expectedBatchValues: readonly TValue[],
  ) {
    const actual = [...batcher.batch(values, transformer)].map((batch) => batch.values);

    return {
      pass: this.equals(actual, expectedBatchValues),
      expected: expectedBatchValues,
      actual,
      message: () =>
        buildMessage(`expected {values} ${this.isNot ? 'not to' : 'to'} batch into the expected values`, { values }),
    };
  },
});
