import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, onTestFinished } from 'vite-plus/test';

import type { ignoreFiles } from './ignores.ts';

import { createIgnoreFilters, defaultIgnorePatterns, resolveIgnoreSource } from './ignores.ts';

type TestSourceFiles = Partial<Record<(typeof ignoreFiles)[number]['fileName'], string>>;

function makeDirectory(files: Readonly<TestSourceFiles>): string {
  const directory = mkdtempSync(path.join(tmpdir(), 'codeformat-ignores-'));
  onTestFinished(() => {
    rmSync(directory, { recursive: true });
  });

  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(path.join(directory, name), contents);
  }
  return directory;
}

describe(resolveIgnoreSource, () => {
  it.for([
    [['.codeformatignore', '.ignore', '.gitignore'], '.codeformatignore'],
    [['.ignore', '.gitignore'], '.ignore'],
    [['.gitignore'], '.gitignore'],
  ] as const)('uses %s and picks %s', ([present, expected]) => {
    const files = Object.fromEntries(present.map((name) => [name, `pattern-for-${name}`])) as TestSourceFiles;
    const directory = makeDirectory(files);
    const source = resolveIgnoreSource(directory);
    expect.assert(source != null, 'The source must be defined.');

    expect(source.filePath).toBe(expected);
  });

  it('returns undefined when no file exists', () => {
    const emptyDirectory = makeDirectory({});
    const source = resolveIgnoreSource(emptyDirectory);
    expect(source).toBeUndefined();
  });

  it('treats an empty file as ignoring nothing', () => {
    const directory = makeDirectory({ '.codeformatignore': '' });
    const source = resolveIgnoreSource(directory);
    expect.assert(source != null, 'The source must be defined.');

    expect(source.filePath).toBe('.codeformatignore');
    expect(source).not.toMatchFilePath('node_modules/pkg/index.js');
  });

  it('does not merge the defaults into a file', () => {
    const directory = makeDirectory({ '.codeformatignore': 'build\n' });
    const source = resolveIgnoreSource(directory);
    expect.assert(source != null, 'The source must be defined.');

    expect(source).toMatchFilePath('build/output.js');
    expect(source).not.toMatchFilePath('node_modules/pkg/index.js');
  });

  describe('additional patterns', () => {
    it('adds the Git directory to a Git ignore file', () => {
      const directory = makeDirectory({ '.gitignore': 'build\n' });
      const source = resolveIgnoreSource(directory);
      expect.assert(source != null, 'The source must be defined.');

      expect(source).toMatchDirectoryPath('.git');
      expect(source).toMatchDirectoryPath('build');
    });

    it('lets a Git ignore file negate the Git directory', () => {
      const directory = makeDirectory({ '.gitignore': '!.git\n' });
      const source = resolveIgnoreSource(directory);
      expect.assert(source != null, 'The source must be defined.');

      expect(source).not.toMatchDirectoryPath('.git');
    });

    it('leaves the Git directory out of files that declare none', () => {
      const directory = makeDirectory({ '.ignore': 'build\n' });
      const source = resolveIgnoreSource(directory);
      expect.assert(source != null, 'The source must be defined.');

      expect(source).not.toMatchDirectoryPath('.git');
    });
  });
});

describe(createIgnoreFilters, () => {
  describe('comments', () => {
    const patterns = ['#directory', '# directory'];

    it.for(['directory', 'directory/nested.txt'])('does not match file %s', (candidate) => {
      expect(patterns).not.toMatchFilePath(candidate);
    });

    it('does not match a directory', () => {
      expect(patterns).not.toMatchDirectoryPath('directory');
    });

    it('matches a hash escaped into a literal', () => {
      expect([String.raw`\#literal`]).toMatchFilePath('#literal');
    });
  });

  describe('blank lines', () => {
    it.for(['anything.txt', 'nested/anything.txt'])('does not match file %s', (candidate) => {
      expect(['', '   ']).not.toMatchFilePath(candidate);
    });
  });

  describe('plain names', () => {
    const patterns = ['node_modules'];

    it.for(['node_modules', 'node_modules/pkg/index.js', 'src/node_modules/pkg/index.js'])(
      'matches file %s at any depth',
      (candidate) => {
        expect(patterns).toMatchFilePath(candidate);
      },
    );

    it.for(['src/app.ts', 'node_modules_extra/pkg.js'])('does not match file %s', (candidate) => {
      expect(patterns).not.toMatchFilePath(candidate);
    });

    it('matches a directory of the same name', () => {
      expect(patterns).toMatchDirectoryPath('node_modules');
    });

    it('ignores a leading current-directory prefix', () => {
      expect(patterns).toMatchFilePath('./node_modules/pkg/index.js');
    });
  });

  describe('directory-only patterns', () => {
    const patterns = ['build/'];

    it('matches the directory but not a file of the same name', () => {
      expect(patterns).toMatchDirectoryPath('build');
      expect(patterns).not.toMatchFilePath('build');
    });

    it.for(['build/output.js', 'build/nested/deep.txt'])('matches contained file %s', (candidate) => {
      expect(patterns).toMatchFilePath(candidate);
    });

    it('does not match a name merely ending with the pattern', () => {
      expect(patterns).not.toMatchDirectoryPath('rebuild');
    });
  });

  describe('root-anchored patterns', () => {
    const patterns = ['/root-only.txt'];

    it('matches at the root', () => {
      expect(patterns).toMatchFilePath('root-only.txt');
    });

    it('does not match nested', () => {
      expect(patterns).not.toMatchFilePath('nested/root-only.txt');
    });
  });

  describe('wildcards', () => {
    const patterns = ['*.log'];

    it.for(['debug.log', 'nested/debug.log', 'logs/output.log'])('matches file %s at any depth', (candidate) => {
      expect(patterns).toMatchFilePath(candidate);
    });

    it('does not match when the extension continues', () => {
      expect(patterns).not.toMatchFilePath('keep.log.txt');
    });
  });

  describe('negations', () => {
    it('excludes a negated file while still matching its siblings', () => {
      const patterns = ['*.log', '!keep.log'];
      expect(patterns).not.toMatchFilePath('keep.log');
      expect(patterns).toMatchFilePath('debug.log');
    });

    it('has no effect when declared before the pattern it negates', () => {
      expect(['!keep.log', '*.log']).toMatchFilePath('keep.log');
    });
  });

  describe('glob stars', () => {
    const patterns = ['**/generated/**'];

    it.for(['generated/x.ts', 'src/a/generated/x.ts'])('matches contained file %s at any depth', (candidate) => {
      expect(patterns).toMatchFilePath(candidate);
    });

    it('does not match the bare directory name as a file', () => {
      expect(patterns).not.toMatchFilePath('src/generated');
    });
  });

  describe('whitespace', () => {
    it('ignores trailing whitespace in a pattern', () => {
      expect(['build ']).toMatchFilePath('build');
    });
  });

  describe('the project root itself', () => {
    it('never matches, whichever filter is used', () => {
      expect(['node_modules']).not.toMatchDirectoryPath('.');
      expect(['node_modules']).not.toMatchFilePath('');
    });
  });

  describe('the defaults', () => {
    it.for(['node_modules', 'vendor'])('matches dependency directory %s', (candidate) => {
      expect(defaultIgnorePatterns).toMatchDirectoryPath(candidate);
    });

    it.for(['node_modules/pkg/index.js', 'vendor/lib/file.php'])('matches contained file %s', (candidate) => {
      expect(defaultIgnorePatterns).toMatchFilePath(candidate);
    });

    it.for(['.git', '.github', 'src/.cache'])('matches hidden directory %s', (candidate) => {
      expect(defaultIgnorePatterns).toMatchDirectoryPath(candidate);
    });

    it.for(['.editorconfig', 'src/.hidden.ts', '.git/config'])('matches hidden file %s', (candidate) => {
      expect(defaultIgnorePatterns).toMatchFilePath(candidate);
    });

    it('does not match project sources', () => {
      expect(defaultIgnorePatterns).not.toMatchFilePath('src/app.ts');
    });
  });
});
