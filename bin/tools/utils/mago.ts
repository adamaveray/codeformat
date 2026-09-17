import type { ScopeFile } from '../../utils/types.ts';

import { EXIT_CODE_OK } from '../../utils/processes.ts';

/**
 * @param dump The effective configuration, as JSON.
 * @param paths The root-relative paths to restrict processing to.
 * @returns The same configuration, processing only those paths.
 */
export function buildScopedConfig(dump: string, paths: readonly string[]): string {
  const config = JSON.parse(dump) as { readonly source?: Readonly<Record<string, unknown>> };
  return JSON.stringify({
    ...config,
    source: {
      ...config.source,
      paths,
      excludes: [], // Excluded paths are dropped even when named explicitly, so the given paths must stand alone
    },
  });
}

/**
 * The four Mago tools read the same configuration, so they share the one generated file.
 */
export const scopeFile: ScopeFile = {
  id: 'magoConfig',
  location: { kind: 'scratch', extension: 'json' },
  build: async (paths, { capture, configPath, output }) => {
    // Load existing config to overwrite paths in (direct extending only appends paths)
    const { exitCode, stdout } = await capture(['--config', configPath, 'config']);
    if (exitCode !== EXIT_CODE_OK) {
      output.error(`Could not read the Mago configuration (exit code ${exitCode}).`);
    }

    return { contents: buildScopedConfig(stdout, paths) };
  },
};

/**
 * @param configPath The project’s own configuration file.
 * @param scopeFilePath The generated configuration restricting the run, if any.
 * @returns The arguments that must precede a subcommand.
 */
export function buildGlobalArgs(configPath: string, scopeFilePath?: string): readonly string[] {
  return ['--config', scopeFilePath ?? configPath];
}
