import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import type { ScopeFile } from '../../utils/types.ts';

/** File names dclint searches for. */
const composeFileNamePattern = /^(?:docker-)?compose.*\.ya?ml$/v;

/** Paths dclint always skips when searching. */
const defaultExcludes = ['node_modules', '.git', '.idea', '.tsimp'] satisfies string[];

/** Configuration file formats `require()` can load. */
const jsRequireCompatibleExtensions = new Set<string>(['.cjs', '.js', '.json', '.ts']);

/**
 * @param directory The absolute path to search within.
 * @returns The absolute paths to every Compose file dclint would find.
 */
function findComposeFiles(directory: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(directory);
  } catch {
    // `dclint` ignores unreadable directories
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry);
    if (defaultExcludes.some((exclude) => entryPath.includes(exclude))) {
      continue;
    }

    const stats = statSync(entryPath);
    if (stats.isDirectory()) {
      files.push(...findComposeFiles(entryPath));
    } else if (stats.isFile() && composeFileNamePattern.test(entry)) {
      files.push(entryPath);
    }
  }
  return files;
}

/**
 * @param configPath The absolute path to the project’s configuration file.
 * @param excludes Additional absolute paths to exclude.
 * @returns A configuration extending the project’s with the additional excludes.
 */
function buildScopedConfig(configPath: string, excludes: readonly string[]): string {
  // language=JavaScript
  return `const config = require(${JSON.stringify(configPath)});

module.exports = {
  ...config,
  exclude: [...(config.exclude ?? []), ...${JSON.stringify(excludes)}],
};
`;
}

/**
 * Excludes every Compose file outside the given paths (dclint does not support including specific file subsets).
 */
export const scopeFile: ScopeFile = {
  id: 'dclintConfig',
  location: { kind: 'scratch', extension: 'cjs' },
  build: (paths, { configPath, output, rootPath }) => {
    const absoluteRootPath = path.resolve(rootPath);
    const absoluteConfigPath = path.resolve(absoluteRootPath, configPath);

    if (!jsRequireCompatibleExtensions.has(path.extname(absoluteConfigPath))) {
      output.error(
        'dclint can only be restricted to specific paths with a JavaScript, TypeScript or JSON configuration file.',
      );
    }

    const absolutePaths = new Map(paths.map((filePath) => [path.resolve(absoluteRootPath, filePath), filePath]));
    const excludes = findComposeFiles(absoluteRootPath).filter((filePath) => !absolutePaths.has(filePath));

    return {
      contents: buildScopedConfig(absoluteConfigPath, excludes),
      unexpressiblePaths: [...absolutePaths]
        .filter(([absolutePath]) => excludes.some((exclude) => absolutePath.includes(exclude)))
        .map(([, filePath]) => filePath),
    };
  },
};
