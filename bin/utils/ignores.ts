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

/** The syntax an ignore file’s patterns are parsed with. */
export type IgnoreDialect =
  /** Full support */
  | 'gitignore'
  /** No escape sequences & trims each line. */
  | 'swiftFormat';

/** Marks generated blocks so leftovers after an unhandled exit can be identified. */
const generatedBlockMarker = 'codeformat generated';
const generatedBlockStart = `# >>> ${generatedBlockMarker} (safe to delete)`;
const generatedBlockEnd = `# <<< ${generatedBlockMarker}`;

export interface IgnoreList {
  readonly contents: string;
  /** The given paths the dialect cannot express, which must be omitted from the list. */
  readonly unexpressiblePaths: readonly string[];
}

/**
 * @param filePath The root-relative path to match literally.
 * @param dialect The syntax the pattern will be parsed with.
 * @returns The path as an ignore pattern matching only itself, or `undefined` if the dialect cannot express it.
 */
function toLiteralPattern(filePath: string, dialect: IgnoreDialect): string | undefined {
  const normalised = filePath.split(path.sep).join('/').replace(/^\.\//v, '');
  if (normalised === '') {
    return undefined;
  }

  switch (dialect) {
    case 'gitignore': {
      return normalised
        .replaceAll('\\', String.raw`\\`) // Must come first, so it does not escape the escapes added below
        .replaceAll(/[*?\[\]]/gv, (character) => `\\${character}`)
        .replace(/ +$/v, (spaces) => spaces.replaceAll(' ', String.raw`\ `)); // Unescaped trailing whitespace is discarded
    }

    case 'swiftFormat': {
      // Without escapes there is no way to match a wildcard literally, and surrounding whitespace is trimmed away
      return /[*?]/v.test(normalised) || normalised !== normalised.trim() ? undefined : normalised;
    }
  }
}

/**
 * Builds an ignore file selecting only the given paths, by excluding everything then reinstating each one.
 *
 * @param paths The root-relative paths to select.
 * @param dialect The syntax the consuming tool parses its ignore file with.
 * @returns The file’s contents, and any paths that had to be omitted.
 */
export function buildIgnoreList(paths: readonly string[], dialect: IgnoreDialect): IgnoreList {
  const patterns: string[] = [];
  const unexpressiblePaths: string[] = [];
  for (const filePath of paths) {
    const pattern = toLiteralPattern(filePath, dialect);
    if (pattern == null) {
      unexpressiblePaths.push(filePath);
      continue;
    }
    // Anchor every pattern to project root
    patterns.push(`!/${pattern}`);
  }

  let restoreDirectories: boolean;
  switch (dialect) {
    case 'gitignore': {
      // Cannot reinstate a file in an excluded directory - re-enable all directories first.
      restoreDirectories = true;
      break;
    }
    case 'swiftFormat': {
      // Directories are never excluded - no restoration necessary
      restoreDirectories = false;
      break;
    }
  }

  const lines = [
    generatedBlockStart,
    '**', // Exclude all
    ...(restoreDirectories ? ['!**/'] : []), // Restore directories if necessary
    ...patterns,
    generatedBlockEnd,
  ];
  return { contents: `${lines.join('\n')}\n`, unexpressiblePaths };
}
