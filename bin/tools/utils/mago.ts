import type Output from '../../utils/Output.ts';
import type { CapturedOutput, ScopeFile } from '../../utils/types.ts';

import { canonicalisePath, omitPaths } from '../../utils/paths.ts';
import { EXIT_CODE_OK } from '../../utils/processes.ts';
import { parseListString } from '../../utils/strings.ts';

interface MagoSourceConfig {
  readonly workspace?: string;
  readonly includes?: readonly string[];

  readonly [key: string]: unknown;
}

interface MagoConfig {
  readonly source?: MagoSourceConfig;

  readonly [key: string]: unknown;
}

/**
 * @param config Mago configuration.
 * @returns Configuration with the includes moved into `paths`, or `undefined` if there are no includes.
 */
function buildIncludesListConfig(config: MagoConfig): MagoConfig | undefined {
  const includes = config.source?.includes ?? [];
  if (includes.length === 0) {
    return undefined;
  }

  // `list-files` only lists files in `paths`
  return {
    ...config,
    source: {
      ...config.source,
      paths: includes,
      includes: [],
    },
  };
}

/**
 * @param config Mago configuration.
 * @param paths The root-relative paths to restrict processing to.
 * @param contextPaths The files Mago should read but not check. Must not contain any of `paths`.
 * @returns The same configuration, processing only the given paths.
 */
function buildScopedConfig(config: MagoConfig, paths: readonly string[], contextPaths: readonly string[]): string {
  return JSON.stringify({
    ...config,
    source: {
      ...config.source,
      paths,
      includes: contextPaths,
      excludes: [], // Mago skips excluded files even when they are listed in `paths`. The context list already has the excludes applied.
    },
  });
}

function makeCapturers(capture: (args: readonly string[]) => Promise<CapturedOutput>, output: Output) {
  const captureSafely = async (configPath: string, args: readonly string[], errorMessage: string): Promise<string> => {
    const { exitCode, stdout } = await capture(['--config', configPath, ...args]);
    if (exitCode !== EXIT_CODE_OK) {
      output.error(`${errorMessage} (exit code ${exitCode}).`);
    }
    return stdout;
  };

  return {
    async json<T>(configPath: string, args: readonly string[], errorMessage: string): Promise<T> {
      return JSON.parse(await captureSafely(configPath, args, errorMessage)) as T;
    },

    async list(configPath: string, args: readonly string[], errorMessage: string): Promise<string[]> {
      return [...parseListString(await captureSafely(configPath, args, errorMessage), '\0')];
    },
  };
}

/**
 * The four Mago tools read the same configuration, so they share the one generated file.
 */
export const scopeFile: ScopeFile = {
  id: 'magoConfig',
  location: { kind: 'scratch', extension: 'json' },
  build: async (paths, { capture, configPath, createFile, output, rootPath }) => {
    const capturers = makeCapturers(capture, output);

    // Load existing config
    const config = await capturers.json<MagoConfig>(configPath, ['config'], 'Could not read the Mago configuration');

    // List every file a full run would include to ensure Mago can analyse cross-file references
    const contextPaths = await capturers.list(configPath, ['list-files', '-0'], 'Could not list the Mago source files');

    const includesListConfig = buildIncludesListConfig(config);
    if (includesListConfig != null) {
      const includesListConfigPath = await createFile(
        'includesListConfig',
        { kind: 'scratch', extension: 'json' },
        () => JSON.stringify(includesListConfig),
      );

      contextPaths.push(
        ...(await capturers.list(
          includesListConfigPath,
          ['list-files', '-0'],
          'Could not list the Mago included files',
        )),
      );
    }

    // Mago resolves symlinks when matching files, so compare the resolved paths
    const workspace = config.source?.workspace ?? rootPath;
    const canonicalPaths = new Set(paths.map((filePath) => canonicalisePath(rootPath, filePath)));
    const filteredContextPaths = omitPaths(canonicalisePath(workspace, '.'), contextPaths, canonicalPaths);

    return { contents: buildScopedConfig(config, paths, filteredContextPaths) };
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
