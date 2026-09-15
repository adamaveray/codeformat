import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, onTestFinished } from 'vite-plus/test';

import type { ResolvedPaths } from './paths.ts';

import { expandPath, FileNotFoundError, createFileExtensionFilter, NonChildPathError, resolvePaths } from './paths.ts';

/** Entries ending in a slash are created as empty directories. */
function makeTemporaryTree(entries: readonly string[]): string {
  const rootPath = mkdtempSync(path.join(tmpdir(), 'codeformat-paths-'));
  onTestFinished(() => {
    rmSync(rootPath, { recursive: true });
  });

  for (const entry of entries) {
    const fullPath = path.join(rootPath, entry);
    if (entry.endsWith('/')) {
      mkdirSync(fullPath, { recursive: true });
    } else {
      mkdirSync(path.dirname(fullPath), { recursive: true });
      writeFileSync(fullPath, '');
    }
  }

  return rootPath;
}

describe(expandPath, () => {
  describe('files', () => {
    const entries = ['root.ts', 'src/app.ts', 'src/nested/deep.ts'];

    it.for(entries)('returns %s itself', (filePath) => {
      const rootPath = makeTemporaryTree(entries);
      expect(filePath).toExpandInPathContextTo([filePath], { rootPath });
    });

    it.for([
      ['node_modules/pkg/index.js', ['node_modules']],
      ['build/output.js', ['build/']],
      ['src/debug.log', ['*.log']],
      ['.hidden/file.ts', ['.*']],
      ['src/generated/x.ts', ['**/generated/**']],
    ] as const satisfies readonly (readonly [ignoredFile: string, ignorePatterns: readonly string[]])[])(
      'returns %s though it is ignored',
      ([ignoredFile, ignorePatterns]) => {
        const rootPath = makeTemporaryTree([ignoredFile]);
        expect(ignoredFile).toExpandInPathContextTo([ignoredFile], { rootPath, ignorePatterns });
      },
    );
  });

  describe('directories', () => {
    it('collects files recursively', () => {
      const rootPath = makeTemporaryTree(['src/app.ts', 'src/nested/deep.ts', 'other.ts']);
      expect('src').toExpandInPathContextTo(['src/app.ts', 'src/nested/deep.ts'], { rootPath });
    });

    it.for(['src', 'src/', './src', './src/', 'src/nested/..'])(
      'accepts a directory spelled as %s',
      (directoryPath) => {
        const rootPath = makeTemporaryTree(['src/app.ts', 'src/nested/deep.ts']);
        expect(directoryPath).toExpandInPathContextTo(['src/app.ts', 'src/nested/deep.ts'], { rootPath });
      },
    );

    it.for([
      ['.', () => '.'],
      ['./', () => './'],
      ['src/..', () => 'src/..'],
      ['src/../.', () => 'src/../.'],
      ['an absolute path', (rootPath: string) => rootPath],
      ['an absolute path with a trailing separator', (rootPath: string) => rootPath + path.sep],
    ] as const satisfies readonly (readonly [label: string, spell: (rootPath: string) => string])[])(
      'walks the root given as %s',
      ([, spell]) => {
        const rootPath = makeTemporaryTree(['src/app.ts', 'src/nested/deep.ts']);
        expect(spell(rootPath)).toExpandInPathContextTo(['src/app.ts', 'src/nested/deep.ts'], { rootPath });
      },
    );

    it('orders the files within a directory by name', () => {
      const rootPath = makeTemporaryTree(['src/z.ts', 'src/a.ts', 'src/m.ts']);
      expect('src').toExpandInPathContextTo(['src/a.ts', 'src/m.ts', 'src/z.ts'], { rootPath });
    });

    it('walks a subdirectory in its sorted position among its siblings', () => {
      const rootPath = makeTemporaryTree(['src/b/inner.ts', 'src/a.ts', 'src/c.ts']);
      expect('src').toExpandInPathContextTo(['src/a.ts', 'src/b/inner.ts', 'src/c.ts'], { rootPath });
    });

    it.for([
      ['an empty directory', { entries: ['docs/'], ignorePatterns: [] }],
      ['a directory holding only empty directories', { entries: ['docs/nested/deeper/'], ignorePatterns: [] }],
      ['a directory whose every entry is ignored', { entries: ['docs/output.js'], ignorePatterns: ['*.js'] }],
    ] as const satisfies readonly (readonly [
      label: string,
      testCase: { readonly entries: readonly string[]; readonly ignorePatterns: readonly string[] },
    ])[])('returns nothing for %s', ([, { entries, ignorePatterns }]) => {
      const rootPath = makeTemporaryTree(entries);
      expect('docs').toExpandInPathContextTo([], { rootPath, ignorePatterns });
    });

    it('keeps the entries of a directory that is only partly ignored', () => {
      const rootPath = makeTemporaryTree(['mixed/keep.ts', 'mixed/debug.log']);
      expect('mixed').toExpandInPathContextTo(['mixed/keep.ts'], { rootPath, ignorePatterns: ['*.log'] });
    });
  });

  describe('ignore patterns', () => {
    const entries = [
      '.hidden/file.ts',
      'build/output.js',
      'node_modules/pkg/index.js',
      'src/app.ts',
      'src/debug.log',
      'src/generated/x.ts',
    ];

    it.for([
      [
        'nothing',
        {
          ignorePatterns: [],
          expectedFiles: [
            '.hidden/file.ts',
            'build/output.js',
            'node_modules/pkg/index.js',
            'src/app.ts',
            'src/debug.log',
            'src/generated/x.ts',
          ],
        },
      ],
      [
        'a plain name',
        {
          ignorePatterns: ['node_modules'],
          expectedFiles: ['.hidden/file.ts', 'build/output.js', 'src/app.ts', 'src/debug.log', 'src/generated/x.ts'],
        },
      ],
      [
        'a directory-only pattern',
        {
          ignorePatterns: ['build/'],
          expectedFiles: [
            '.hidden/file.ts',
            'node_modules/pkg/index.js',
            'src/app.ts',
            'src/debug.log',
            'src/generated/x.ts',
          ],
        },
      ],
      [
        'a wildcard',
        {
          ignorePatterns: ['*.log'],
          expectedFiles: [
            '.hidden/file.ts',
            'build/output.js',
            'node_modules/pkg/index.js',
            'src/app.ts',
            'src/generated/x.ts',
          ],
        },
      ],
      [
        'a glob star',
        {
          ignorePatterns: ['**/generated/**'],
          expectedFiles: [
            '.hidden/file.ts',
            'build/output.js',
            'node_modules/pkg/index.js',
            'src/app.ts',
            'src/debug.log',
          ],
        },
      ],
      [
        'a hidden-name pattern',
        {
          ignorePatterns: ['.*'],
          expectedFiles: [
            'build/output.js',
            'node_modules/pkg/index.js',
            'src/app.ts',
            'src/debug.log',
            'src/generated/x.ts',
          ],
        },
      ],
      [
        'a negation',
        {
          ignorePatterns: ['src/*', '!src/app.ts'],
          expectedFiles: ['.hidden/file.ts', 'build/output.js', 'node_modules/pkg/index.js', 'src/app.ts'],
        },
      ],
    ] as const satisfies readonly (readonly [
      label: string,
      testCase: { readonly ignorePatterns: readonly string[]; readonly expectedFiles: readonly string[] },
    ])[])('omits the files matched by %s', ([, { ignorePatterns, expectedFiles }]) => {
      const rootPath = makeTemporaryTree(entries);
      expect('.').toExpandInPathContextTo(expectedFiles, { rootPath, ignorePatterns });
    });

    it.for([
      ['build', ['build/']],
      ['node_modules', ['node_modules']],
      ['.hidden', ['.*']],
    ] as const satisfies readonly (readonly [ignoredDirectory: string, ignorePatterns: readonly string[]])[])(
      'returns nothing within ignored directory %s named explicitly',
      ([ignoredDirectory, ignorePatterns]) => {
        const rootPath = makeTemporaryTree([`${ignoredDirectory}/file.js`]);
        expect(ignoredDirectory).toExpandInPathContextTo([], { rootPath, ignorePatterns });
      },
    );
  });

  describe('rejected paths', () => {
    it.for(['src/nope.ts', 'nope', 'nope/deep.ts', './src/nope.ts'])('names %s as it was given', (missingPath) => {
      const rootPath = makeTemporaryTree(['src/app.ts']);
      expect(missingPath).toBeRejectedInPathContextWith(FileNotFoundError, { rootPath });
    });

    it.for([
      ['..', '..'],
      ['../', '../'],
      ['./..', './..'],
      ['src/../..', 'src/../..'],
      ['a non-existent path outside the root', '../outside.ts'],
      ['another root entirely', '/other/path'],
    ] as const satisfies readonly (readonly [label: string, outsidePath: string])[])(
      'rejects %s for falling outside the root',
      ([, outsidePath]) => {
        const rootPath = makeTemporaryTree(['src/app.ts']);
        expect(outsidePath).toBeRejectedInPathContextWith(NonChildPathError, { rootPath });
      },
    );

    it.for(['..dotted.ts', '..dotted/file.ts'])('allows %s for merely starting with two dots', (dottedPath) => {
      const rootPath = makeTemporaryTree([dottedPath]);
      expect(dottedPath).toExpandInPathContextTo([dottedPath], { rootPath });
    });
  });
});

describe(resolvePaths, () => {
  const entries = ['build/output.js', 'docs/', 'src/app.ts', 'src/nested/deep.ts'];
  const ignorePatterns = ['build'];

  it.for([
    [
      'the order the paths were given in',
      {
        pathNames: ['src/nested', 'src/app.ts'],
        expected: { files: ['src/nested/deep.ts', 'src/app.ts'], emptyPaths: [] },
      },
    ],
    [
      'that same order reversed',
      {
        pathNames: ['src/app.ts', 'src/nested'],
        expected: { files: ['src/app.ts', 'src/nested/deep.ts'], emptyPaths: [] },
      },
    ],
    [
      'a directory repeated around a file it contains',
      {
        pathNames: ['src', 'src/app.ts', 'src'],
        expected: { files: ['src/app.ts', 'src/nested/deep.ts'], emptyPaths: [] },
      },
    ],
    [
      'a file already covered by a directory given after it',
      {
        pathNames: ['src/app.ts', 'src'],
        expected: { files: ['src/app.ts', 'src/nested/deep.ts'], emptyPaths: [] },
      },
    ],
    [
      'the root alongside a path within it',
      {
        pathNames: ['.', 'src/app.ts'],
        expected: { files: ['src/app.ts', 'src/nested/deep.ts'], emptyPaths: [] },
      },
    ],
    ['no paths at all', { pathNames: [], expected: { files: [], emptyPaths: [] } }],
  ] as const satisfies readonly (readonly [
    label: string,
    testCase: { readonly pathNames: readonly string[]; readonly expected: ResolvedPaths },
  ])[])('keeps %s, without repeats', ([, { pathNames, expected }]) => {
    const rootPath = makeTemporaryTree(entries);
    expect(pathNames).toResolveInPathContextTo(expected, { rootPath, ignorePatterns });
  });

  describe('paths matching no files', () => {
    it.for([
      ['an empty directory', { pathNames: ['docs'], expected: { files: [], emptyPaths: ['docs'] } }],
      [
        'an empty directory reported as it was given, not as resolved',
        { pathNames: ['./docs/'], expected: { files: [], emptyPaths: ['./docs/'] } },
      ],
      ['an ignored directory', { pathNames: ['build'], expected: { files: [], emptyPaths: ['build'] } }],
      [
        'an empty directory among paths that match',
        {
          pathNames: ['src', 'docs', 'build/output.js'],
          expected: { files: ['src/app.ts', 'src/nested/deep.ts', 'build/output.js'], emptyPaths: ['docs'] },
        },
      ],
      [
        'nothing for a path repeated after it already matched',
        { pathNames: ['src', 'src'], expected: { files: ['src/app.ts', 'src/nested/deep.ts'], emptyPaths: [] } },
      ],
      [
        'nothing when every path matched',
        {
          pathNames: ['src', 'build/output.js'],
          expected: { files: ['src/app.ts', 'src/nested/deep.ts', 'build/output.js'], emptyPaths: [] },
        },
      ],
    ] as const satisfies readonly (readonly [
      label: string,
      testCase: { readonly pathNames: readonly string[]; readonly expected: ResolvedPaths },
    ])[])('reports %s', ([, { pathNames, expected }]) => {
      const rootPath = makeTemporaryTree(entries);
      expect(pathNames).toResolveInPathContextTo(expected, { rootPath, ignorePatterns });
    });
  });
});

describe(createFileExtensionFilter, () => {
  it.for(['app.ts', 'src/app.ts', 'src/nested/deep.ts'])('matches %s against a single extension', (filePath) => {
    expect(createFileExtensionFilter(['ts'])).toMatchAsTest(filePath);
  });

  it.for(['app.ts', 'src/app.js', 'src/style.css'])('matches %s against several extensions', (filePath) => {
    expect(createFileExtensionFilter(['css', 'js', 'ts'])).toMatchAsTest(filePath);
  });

  it.for(['app.js', 'app', '.ts', 'src/ts', 'app.ts.bak'])(
    'does not match %s against a single extension',
    (filePath) => {
      expect(createFileExtensionFilter(['ts'])).not.toMatchAsTest(filePath);
    },
  );

  it.for(['app.php', 'app.swift', 'README', '.gitignore'])(
    'does not match %s against several extensions',
    (filePath) => {
      expect(createFileExtensionFilter(['css', 'js', 'ts'])).not.toMatchAsTest(filePath);
    },
  );

  it.for(['app.TS', 'app.Ts', 'src/APP.TS'])('matches %s whatever the case of the path', (filePath) => {
    expect(createFileExtensionFilter(['ts'])).toMatchAsTest(filePath);
  });

  it.for(['types.d.ts', 'app.config.ts'])('matches the final extension of %s', (filePath) => {
    expect(createFileExtensionFilter(['ts'])).toMatchAsTest(filePath);
  });

  it.for(['types.d.ts', 'app.config.ts'])('does not match an earlier extension of %s', (filePath) => {
    expect(createFileExtensionFilter(['config', 'd'])).not.toMatchAsTest(filePath);
  });

  it.for(['app.ts', 'app', '.gitignore', 'src/nested/deep.js'])(
    'does not match %s given no extensions at all',
    (filePath) => {
      expect(createFileExtensionFilter([])).not.toMatchAsTest(filePath);
    },
  );
});
