import makeIgnore from 'ignore';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type { NonEmptyArray } from './types.ts';

interface IgnoreFile {
  readonly fileName: string;
  /** Additional patterns to prepend if the ignore file itself is used. */
  readonly additionalPatterns: readonly string[];
}

/** Files containing ignore patterns, in order of priority. */
export const ignoreFiles = [
  { fileName: '.codeformatignore', additionalPatterns: [] },
  { fileName: '.ignore', additionalPatterns: [] },
  { fileName: '.gitignore', additionalPatterns: ['.git'] },
] as const satisfies NonEmptyArray<IgnoreFile>;

/** Ignore patterns to use if no patterns are defined. */
export const defaultIgnorePatterns: NonEmptyArray<string> = [
  '.*', // Hidden files & directories
  'node_modules', // NodeJS packages
  'vendor', // PHP Composer packages
];

export type IgnoreFilter = (relativePath: string, isDirectory?: boolean) => boolean;
export type IgnoreFilters = Record<'file' | 'directory', IgnoreFilter>;

export interface IgnoreSource {
  readonly filePath: string;
  readonly patterns: readonly string[];
}

/**
 * @param directory The directory to search for ignore files within.
 * @returns The primary ignore source found if any.
 */
export function resolveIgnoreSource(directory: string): IgnoreSource | undefined {
  for (const { fileName, additionalPatterns = [] } of ignoreFiles) {
    const filePath = path.resolve(directory, fileName);
    if (!existsSync(filePath)) {
      continue;
    }

    return {
      filePath: fileName,
      patterns: [...additionalPatterns, ...readFileSync(filePath, 'utf8').split(/\r?\n/v)],
    };
  }

  return undefined;
}

/**
 * @param patterns Ignore patterns to match against.
 * @returns Function testing whether root-relative paths match any pattern.
 */
export function createIgnoreFilters(patterns: readonly string[]): IgnoreFilters {
  const matcher = makeIgnore().add([...patterns]);

  const processedMatcher: IgnoreFilter = (relativePath) => {
    const normalised = relativePath.split(path.sep).join('/').replace(/^\.\//v, '');
    if (normalised === '' || normalised === '.') {
      return false;
    }

    return matcher.ignores(normalised);
  };

  return {
    file: processedMatcher,
    directory: (relativePath) => processedMatcher(`${relativePath}/`), // Ensure directory-only pattern matches
  };
}
