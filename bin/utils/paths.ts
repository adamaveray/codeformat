import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import type { IgnoreFilters } from './ignores.ts';
import type { FileExtension } from './types.ts';

export interface PathContext {
  /** The directory paths are resolved relative to. */
  readonly rootPath: string;
  /** Filters determining which paths within a directory to omit. */
  readonly ignoreFilters: IgnoreFilters;
}

export interface ResolvedPaths {
  /** Root-relative paths of every matched file, in the order their paths were given. */
  readonly files: readonly string[];
  /** The paths that matched no files, as they were given. */
  readonly emptyPaths: readonly string[];
}

/** An error concerning one specific file or directory path. */
export abstract class FileError extends Error {
  constructor(
    message: string,
    /** The path the error concerns, exactly as it was given. */
    public readonly filePath: string,
  ) {
    super(message);
    this.name = 'FileError';
  }
}

/** Thrown when a path does not exist. */
export class FileNotFoundError extends FileError {
  constructor(filePath: string) {
    super(`Path not found: "${filePath}"`, filePath);
    this.name = 'FileNotFoundError';
  }
}

/** Thrown when a path resolves outside the root it is relative to. */
export class NonChildPathError extends FileError {
  constructor(filePath: string) {
    super(`Path is outside the project directory: "${filePath}"`, filePath);
    this.name = 'NonChildPathError';
  }
}

/**
 * @returns Whether the given path would resolve inside a directory.
 */
function isChildPath(testPath: string): boolean {
  return testPath !== '..' && !testPath.startsWith(`..${path.sep}`) && !path.isAbsolute(testPath);
}

/**
 * @param relativeDirectory The root-relative directory to iterate.
 * @param context The root to resolve within & the filters to apply.
 * @yields The root-relative path of every file below the directory.
 */
function* iterateSubDirectory(relativeDirectory: string, context: PathContext): Iterable<string> {
  const entries = readdirSync(path.resolve(context.rootPath, relativeDirectory), { withFileTypes: true });
  entries.sort((a, b) => (a.name < b.name ? -1 : 1)); // Ensure consistent order

  for (const entry of entries) {
    const entrySubPath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory() && !context.ignoreFilters.directory(entrySubPath)) {
      yield* iterateSubDirectory(entrySubPath, context);
    }
    if (entry.isFile() && !context.ignoreFilters.file(entrySubPath)) {
      yield entrySubPath;
    }
  }
}

/**
 * @param pathName The file or directory path to expand.
 * @param context The root to resolve within & the filters to apply.
 * @returns The files the path covers.
 * @throws {NonChildPathError} If the path falls outside the root.
 * @throws {FileNotFoundError} If the path does not exist.
 */
export function expandPath(pathName: string, context: PathContext): readonly string[] {
  const absolutePath = path.resolve(context.rootPath, pathName);
  const relativePath = path.relative(context.rootPath, absolutePath);
  if (!isChildPath(relativePath)) {
    throw new NonChildPathError(pathName);
  }

  const stats = statSync(absolutePath, { throwIfNoEntry: false });
  if (stats == null) {
    throw new FileNotFoundError(pathName);
  }

  return stats.isDirectory()
    ? [...iterateSubDirectory(relativePath === '' ? '.' : relativePath, context)]
    : [relativePath];
}

/**
 * @param pathNames The file & directory paths to resolve.
 * @param context The root to resolve within & the filters to apply.
 * @returns The files to process.
 * @throws {NonChildPathError} If a path falls outside the root.
 * @throws {FileNotFoundError} If a path does not exist.
 */
export function resolvePaths(pathNames: readonly string[], context: PathContext): ResolvedPaths {
  const files = new Set<string>();
  const emptyPaths: string[] = [];

  for (const pathName of pathNames) {
    const matches = expandPath(pathName, context);
    if (matches.length === 0) {
      emptyPaths.push(pathName);
    }
    for (const match of matches) {
      files.add(match);
    }
  }

  return { files: [...files], emptyPaths };
}

/**
 * @param fileExtensions The extensions to match.
 * @returns Function testing whether a file path carries one of the extensions.
 */
export function createFileExtensionFilter(fileExtensions: readonly FileExtension[]): (filePath: string) => boolean {
  const matchedExtensions = new Set<string>(fileExtensions);
  return (filePath) => matchedExtensions.has(path.extname(filePath).slice(1).toLowerCase());
}

/**
 * @param pathName A file path name.
 * @param testDirectory A directory to test whether pathName is equal to.
 * @returns Whether pathName resolves to equal testDirectory.
 */
export function pathEqualsDirectory(pathName: string, testDirectory: string): boolean {
  return path.relative(testDirectory, path.resolve(testDirectory, pathName)) === '';
}
