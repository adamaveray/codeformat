/* oxlint-disable no-magic-numbers -- Configuration values read more clearly inline. */

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { describe, expect, it, onTestFinished, vi } from 'vite-plus/test';

import type { GeneratedFileLocation } from '../../utils/GeneratedFiles.ts';
import type { CapturedOutput, ScopeFileContext } from '../../utils/types.ts';

import Output from '../../utils/Output.ts';
import { buildGlobalArgs, scopeFile } from './mago.ts';

interface ParsedConfig {
  readonly source: Readonly<Record<string, unknown>>;

  readonly [key: string]: unknown;
}

interface CreatedFile {
  readonly id: string;
  readonly location: GeneratedFileLocation;
  readonly contents: string;
}

/** The Mago commands the simulated Mago can be made to fail. */
type MagoCommand = 'config' | 'projectList' | 'includesList';

const includesListConfigPath = 'includes-list.json';

function parseConfig(json: string): ParsedConfig {
  return JSON.parse(json) as ParsedConfig;
}

/**
 * @returns A project directory, reached through a symlink.
 */
function createSymlinkedProject(): string {
  const directory = mkdtempSync(path.join(tmpdir(), 'codeformat-mago-'));
  onTestFinished(() => {
    rmSync(directory, { recursive: true });
  });
  mkdirSync(path.join(directory, 'project/src'), { recursive: true });
  writeFileSync(path.join(directory, 'project/src/a.php'), '<?php\n');
  symlinkSync(path.join(directory, 'project'), path.join(directory, 'link'));
  return path.join(directory, 'link');
}

/**
 * Builds the scope file against a simulated Mago, listing the given files.
 */
async function runBuild(
  paths: readonly string[],
  {
    buildConfig = (workspacePath: string): object => ({
      version: '1',
      source: { workspace: workspacePath, paths: ['.'], includes: [], excludes: [] },
    }),
    projectFiles = [] as readonly string[] | ((workspace: string) => readonly string[]),
    includedFiles = [] as readonly string[],
    failingCommand = undefined as MagoCommand | undefined,
  } = {},
) {
  const rootPath = createSymlinkedProject();
  const workspace = realpathSync(rootPath);
  const createdFiles: CreatedFile[] = [];
  const captured: (readonly string[])[] = [];

  const output = new Output('test', { debug: false, verbose: false });
  vi.spyOn(output, 'error').mockImplementation((message) => {
    throw new Error(message);
  });

  const context: ScopeFileContext = {
    rootPath,
    configPath: 'mago.toml',
    output,
    capture: async (args): Promise<CapturedOutput> => {
      captured.push(args);
      const [, configArg, command] = args;
      let magoCommand: MagoCommand = 'projectList';
      if (command === 'config') {
        magoCommand = 'config';
      } else if (configArg === includesListConfigPath) {
        magoCommand = 'includesList';
      }
      if (magoCommand === failingCommand) {
        return { exitCode: 1, stdout: '' };
      }

      let stdout: string;
      switch (magoCommand) {
        case 'config': {
          stdout = JSON.stringify(buildConfig(workspace));
          break;
        }
        case 'projectList': {
          const files = typeof projectFiles === 'function' ? projectFiles(workspace) : projectFiles;
          stdout = files.map((filePath) => `${filePath}\0`).join('');
          break;
        }
        case 'includesList': {
          stdout = includedFiles.map((filePath) => `${filePath}\0`).join('');
          break;
        }
      }
      return { exitCode: 0, stdout };
    },
    createFile: async (id, location, build) => {
      createdFiles.push({ id, location, contents: await build() });
      return includesListConfigPath;
    },
  };

  const config = parseConfig((await scopeFile.build(paths, context)).contents);
  return { captured, config, createdFiles, source: config.source, workspace };
}

describe('scopeFile.build', () => {
  it('restricts processing to the given paths', async () => {
    const { source } = await runBuild(['src/a.php', 'src/b.php']);
    expect(source['paths']).toStrictEqual(['src/a.php', 'src/b.php']);
  });

  it('clears the excludes, so a given path is never dropped', async () => {
    const { source } = await runBuild(['src/a.php'], {
      buildConfig: (workspace) => ({ source: { workspace, paths: ['.'], excludes: ['src/**'] } }),
    });
    expect(source['excludes']).toStrictEqual([]);
  });

  it('preserves the rest of the configuration', async () => {
    const { config, source, workspace } = await runBuild(['src/a.php'], {
      buildConfig: (configWorkspace) => ({
        version: '1',
        threads: 12,
        source: { workspace: configWorkspace, paths: ['.'], extensions: ['php'] },
        linter: { rules: { 'no-empty': true } },
      }),
    });
    expect(config).toMatchObject({ version: '1', threads: 12, linter: { rules: { 'no-empty': true } } });
    expect(source).toMatchObject({ workspace, extensions: ['php'] });
  });

  it('handles a configuration with no source section', async () => {
    const { source } = await runBuild(['src/a.php'], {
      buildConfig: () => ({ version: '1' }),
      projectFiles: ['src/b.php'],
    });
    expect(source).toStrictEqual({ paths: ['src/a.php'], includes: ['src/b.php'], excludes: [] });
  });

  it('reads the project files as context', async () => {
    const { source } = await runBuild(['src/a.php'], { projectFiles: ['src/b.php', 'src/c.php'] });
    expect(source['includes']).toStrictEqual(['src/b.php', 'src/c.php']);
  });

  it.for([
    ['a relative path', () => 'src/a.php'],
    ['an absolute path', (workspace: string) => path.join(workspace, 'src/a.php')],
    ['an unnormalised path', () => './src/../src/a.php'],
  ] as const satisfies readonly (readonly [label: string, listPath: (workspace: string) => string])[])(
    'leaves a given file out of the context when listed as %s',
    async ([, listPath]) => {
      const { source } = await runBuild(['src/a.php'], {
        projectFiles: (workspace) => [listPath(workspace), 'src/b.php'],
      });
      expect(source['includes']).toStrictEqual(['src/b.php']);
    },
  );

  it('leaves given files out of the context when reached through a symlink', async () => {
    const { source } = await runBuild(['src/a.php', 'src/missing.php'], {
      projectFiles: ['src/a.php', 'src/b.php', 'src/missing.php'],
    });
    expect(source['paths']).toStrictEqual(['src/a.php', 'src/missing.php']);
    expect(source['includes']).toStrictEqual(['src/b.php']);
  });

  it('reads the included files as context', async () => {
    const { source } = await runBuild(['src/a.php'], {
      buildConfig: (workspace) => ({ source: { workspace, paths: ['.'], includes: ['vendor'] } }),
      projectFiles: ['src/b.php'],
      includedFiles: ['vendor/lib.php'],
    });
    expect(source['includes']).toStrictEqual(['src/b.php', 'vendor/lib.php']);
  });

  it('lists the included files with the excludes applied', async () => {
    const { captured, createdFiles } = await runBuild(['src/a.php'], {
      buildConfig: (workspace) => ({
        source: { workspace, paths: ['.'], includes: ['vendor', '/stubs'], excludes: ['vendor/**/tests/**'] },
      }),
    });

    const [createdFile] = createdFiles;
    expect.assert(createdFile != null, 'The includes list configuration must be created.');
    expect(createdFile.location).toStrictEqual({ kind: 'scratch', extension: 'json' });
    expect(parseConfig(createdFile.contents).source).toMatchObject({
      paths: ['vendor', '/stubs'],
      includes: [],
      excludes: ['vendor/**/tests/**'],
    });
    expect(captured).toContainEqual(['--config', includesListConfigPath, 'list-files', '-0']);
  });

  it('skips listing included files when there are none', async () => {
    const { captured, createdFiles } = await runBuild(['src/a.php']);
    expect(createdFiles).toStrictEqual([]);
    expect(captured).toStrictEqual([
      ['--config', 'mago.toml', 'config'],
      ['--config', 'mago.toml', 'list-files', '-0'],
    ]);
  });

  it.for([
    ['config', 'Could not read the Mago configuration (exit code 1).'],
    ['projectList', 'Could not list the Mago source files (exit code 1).'],
    ['includesList', 'Could not list the Mago included files (exit code 1).'],
  ] as const satisfies readonly (readonly [failingCommand: MagoCommand, message: string])[])(
    'reports a failing %s command',
    async ([failingCommand, message]) => {
      await expect(
        runBuild(['src/a.php'], {
          buildConfig: (workspace) => ({ source: { workspace, paths: ['.'], includes: ['vendor'] } }),
          failingCommand,
        }),
      ).rejects.toThrow(message);
    },
  );
});

describe('scopeFile.build with Mago', () => {
  const magoPath = path.resolve(import.meta.dirname, '../../../vendor/bin/mago');

  interface MagoIssue {
    readonly code: string;
    readonly file: string;
  }

  interface MagoReport {
    readonly issues: readonly {
      readonly code: string;
      readonly annotations: readonly { readonly span: { readonly file_id: { readonly name: string } } }[];
    }[];
  }

  const project = {
    'mago.toml': `
version = "1"
php-version = "8.5"

[source]
paths = ["."]
includes = ["vendor"]
excludes = ["excluded/**"]
`,
    // Reads a property of a class in another project file & creates a class from an included file
    'src/ClassOne.php': `<?php

declare(strict_types=1);

namespace App;

/** @api */
final class ClassOne
{
    public function run(ClassTwo $two): string
    {
        new \\Lib\\VendorClass();

        return $two->name;
    }
}
`,
    'src/ClassTwo.php': `<?php

declare(strict_types=1);

namespace App;

/** @api */
final class ClassTwo
{
    public string $name = 'two';

    public function invalid(): int
    {
        return 'not an int';
    }
}
`,
    'excluded/Excluded.php': `<?php

declare(strict_types=1);

namespace App;

/** @api */
final class Excluded
{
    public function invalid(): int
    {
        return 'not an int';
    }
}
`,
    'vendor/lib/VendorClass.php': `<?php

declare(strict_types=1);

namespace Lib;

final class VendorClass {}
`,
  };

  /**
   * @returns The exit code & standard output of the real Mago binary.
   */
  function runMago(directory: string, args: readonly string[]): CapturedOutput {
    const { status, stdout } = spawnSync(magoPath, args, {
      cwd: directory,
      encoding: 'utf8',
      env: { ...process.env, MAGO_NO_VERSION_CHECK: 'true' },
    });
    return { exitCode: status ?? 1, stdout };
  }

  /**
   * @returns The issues Mago's analyser reports when restricted to the given paths.
   */
  async function analyseScoped(paths: readonly string[]): Promise<readonly MagoIssue[]> {
    const directory = mkdtempSync(path.join(tmpdir(), 'codeformat-mago-'));
    onTestFinished(() => {
      rmSync(directory, { recursive: true });
    });
    const projectPath = path.join(directory, 'project');
    for (const [filePath, contents] of Object.entries(project)) {
      mkdirSync(path.dirname(path.join(projectPath, filePath)), { recursive: true });
      writeFileSync(path.join(projectPath, filePath), contents);
    }

    let fileIndex = 0;
    const writeScratchFile = (contents: string): string => {
      fileIndex += 1;
      const filePath = path.join(directory, `generated-${fileIndex}.json`);
      writeFileSync(filePath, contents);
      return filePath;
    };

    const { contents: scopedConfig } = await scopeFile.build(paths, {
      rootPath: projectPath,
      configPath: 'mago.toml',
      output: new Output('test', { debug: false, verbose: false }),
      capture: async (args) => runMago(projectPath, args),
      createFile: async (_id, _location, build) => writeScratchFile(await build()),
    });

    const { stdout } = runMago(projectPath, [
      '--config',
      writeScratchFile(scopedConfig),
      'analyze',
      '--reporting-format',
      'json',
    ]);
    expect.assert(stdout !== '', 'Mago found no files to analyse.');
    const report = JSON.parse(stdout) as MagoReport;
    return report.issues.map(({ code, annotations }) => ({ code, file: annotations[0]?.span.file_id.name ?? '' }));
  }

  it('resolves classes defined outside the given paths without checking them', async () => {
    await expect(analyseScoped(['src/ClassOne.php'])).resolves.toStrictEqual([]);
  });

  it.for([
    ['a file in the project', 'src/ClassTwo.php'],
    ['a file in an excluded directory', 'excluded/Excluded.php'],
  ] as const satisfies readonly (readonly [label: string, filePath: string])[])('checks %s', async ([, filePath]) => {
    await expect(analyseScoped([filePath])).resolves.toStrictEqual([
      { code: 'invalid-return-statement', file: filePath },
    ]);
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
