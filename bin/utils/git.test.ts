/* oxlint-disable unicorn/no-useless-spread -- Used to group arguments. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, onTestFinished } from 'vite-plus/test';

import { getStagedFiles, GitError } from './git.ts';

function gitExec(rootPath: string, args: readonly string[]): void {
  execFileSync('git', args, { cwd: rootPath, stdio: 'ignore' });
}

function makeTemporaryDirectory(): string {
  const rootPath = mkdtempSync(path.join(tmpdir(), 'codeformat-git-'));
  onTestFinished(() => {
    rmSync(rootPath, { recursive: true });
  });
  return rootPath;
}

function writeFile(rootPath: string, filePath: string, contents: string): void {
  const fullPath = path.join(rootPath, filePath);
  mkdirSync(path.dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, contents);
}

/** Entries ending in a slash are created as empty directories. */
function makeRepository(entries: readonly string[] = []): string {
  const rootPath = makeTemporaryDirectory();
  gitExec(rootPath, ['init']);
  // Isolate the repository from the local Git configuration
  gitExec(rootPath, ['config', 'core.excludesFile', '/dev/null']);

  for (const entry of entries) {
    if (entry.endsWith('/')) {
      mkdirSync(path.join(rootPath, entry), { recursive: true });
    } else {
      writeFile(rootPath, entry, `${entry}\n`);
    }
  }
  return rootPath;
}

function commitAll(rootPath: string): void {
  gitExec(rootPath, ['add', '--all']);
  gitExec(rootPath, [
    ...['-c', 'user.name=Test'],
    ...['-c', 'user.email=test@example.com'],
    ...['-c', 'commit.gpgSign=false'],
    'commit',
    ...['--message', 'init'],
  ]);
}

describe(getStagedFiles, () => {
  it('returns nothing when nothing is staged', () => {
    const rootPath = makeRepository(['untracked.ts']);
    expect(getStagedFiles(rootPath)).toStrictEqual({ files: [], missingPaths: [] });
  });

  it.for([
    ['a file at the root', ['root.ts'], ['root.ts']],
    ['a nested file', ['src/app.ts'], ['src/app.ts']],
    ['several files', ['src/app.ts', 'styles.css'], ['src/app.ts', 'styles.css']],
  ] as const satisfies readonly (readonly [label: string, staged: readonly string[], expected: readonly string[]])[])(
    'returns %s',
    ([, staged, expected]) => {
      const rootPath = makeRepository(staged);
      gitExec(rootPath, ['add', '--', ...staged]);

      expect(getStagedFiles(rootPath).files).toStrictEqual([...expected]);
    },
  );

  it('excludes untracked & unstaged files', () => {
    const rootPath = makeRepository(['staged.ts', 'untracked.ts', 'committed.ts']);
    commitAll(rootPath);

    writeFile(rootPath, 'committed.ts', 'modified but not staged\n');
    writeFile(rootPath, 'staged.ts', 'modified & staged\n');
    gitExec(rootPath, ['add', '--', 'staged.ts']);

    expect(getStagedFiles(rootPath).files).toStrictEqual(['staged.ts']);
  });

  it('excludes staged deletions', () => {
    const rootPath = makeRepository(['kept.ts', 'removed.ts']);
    commitAll(rootPath);

    gitExec(rootPath, ['rm', '--quiet', '--', 'removed.ts']);
    writeFile(rootPath, 'kept.ts', 'modified\n');
    gitExec(rootPath, ['add', '--', 'kept.ts']);

    expect(getStagedFiles(rootPath).files).toStrictEqual(['kept.ts']);
  });

  it('reports a staged file since deleted from the working tree as missing', () => {
    const rootPath = makeRepository(['present.ts', 'gone.ts']);
    gitExec(rootPath, ['add', '--', 'present.ts', 'gone.ts']);
    unlinkSync(path.join(rootPath, 'gone.ts'));

    expect(getStagedFiles(rootPath)).toStrictEqual({ files: ['present.ts'], missingPaths: ['gone.ts'] });
  });

  it('returns paths relative to a subdirectory & excludes those outside it', () => {
    const rootPath = makeRepository(['outside.ts', 'src/app.ts', 'src/nested/deep.ts']);
    gitExec(rootPath, ['add', '--all']);

    expect(getStagedFiles(path.join(rootPath, 'src'))).toStrictEqual({
      files: ['app.ts', 'nested/deep.ts'],
      missingPaths: [],
    });
  });

  it.for(['with spaces.ts', 'accentué.ts', "quote'd.ts"])('handles the unusual name %s', (fileName) => {
    const rootPath = makeRepository([fileName]);
    gitExec(rootPath, ['add', '--', fileName]);

    expect(getStagedFiles(rootPath).files).toStrictEqual([fileName]);
  });

  it('works in a repository with no commits', () => {
    const rootPath = makeRepository(['first.ts']);
    gitExec(rootPath, ['add', '--', 'first.ts']);

    expect(getStagedFiles(rootPath).files).toStrictEqual(['first.ts']);
  });

  it('returns a staged modification to a committed file', () => {
    const rootPath = makeRepository(['app.ts']);
    commitAll(rootPath);

    writeFile(rootPath, 'app.ts', 'changed\n');
    gitExec(rootPath, ['add', '--', 'app.ts']);

    expect(getStagedFiles(rootPath).files).toStrictEqual(['app.ts']);
  });

  it('returns the new name of a staged rename', () => {
    const rootPath = makeRepository(['before.ts']);
    commitAll(rootPath);

    gitExec(rootPath, ['mv', 'before.ts', 'after.ts']);

    expect(getStagedFiles(rootPath).files).toStrictEqual(['after.ts']);
  });

  it('throws outside a repository', () => {
    const directory = makeTemporaryDirectory();
    expect(() => getStagedFiles(directory)).toThrow(GitError);
    expect(() => getStagedFiles(directory)).toThrow('Not a Git repository');
  });

  it('ignores a repository inherited from the environment', () => {
    const rootPath = makeRepository(['app.ts']);
    gitExec(rootPath, ['add', '--', 'app.ts']);

    const outsideDirectory = makeTemporaryDirectory();
    process.env['GIT_DIR'] = path.join(rootPath, '.git');
    onTestFinished(() => {
      delete process.env['GIT_DIR'];
    });

    expect(() => getStagedFiles(outsideDirectory)).toThrow(GitError);
  });
});
