import path from 'node:path';

import type { ScopeFile } from '../../utils/types.ts';

/**
 * @returns The string as a PHP string literal.
 */
export function toPhpString(value: string): string {
  return `'${value.replaceAll(/[\\']/gv, (char) => `\\${char}`)}'`;
}

/**
 * @param configPath The absolute path to the project’s own configuration file.
 * @param filePaths The absolute paths to restrict processing to.
 * @returns A configuration processing only the files matched by both the project’s configuration & the given paths.
 */
export function buildScopedConfig(configPath: string, filePaths: readonly string[]): string {
  return `<?php

declare(strict_types=1);

$config = require ${toPhpString(configPath)};

// Filter the project's own finder so its excludes still apply
$paths = array_flip(array_filter(array_map('realpath', [${filePaths.map((filePath) => toPhpString(filePath)).join(', ')}])));
$files = [];
foreach ($config->getFinder() as $file) {
  $realPath = $file->getRealPath();
  if ($realPath !== false && isset($paths[$realPath])) {
    $files[] = $file;
  }
}

return $config->setFinder($files);
`;
}

export const scopeFile: ScopeFile = {
  id: 'phpCsFixerConfig',
  location: { kind: 'scratch', extension: 'php' },
  build: (paths, { configPath, rootPath }) => {
    // Resolve absolute paths for use in external generated file
    const resolve = (pathName: string) => path.resolve(rootPath, pathName);
    return {
      contents: buildScopedConfig(
        resolve(configPath),
        paths.map((pathName) => resolve(pathName)),
      ),
    };
  },
};
