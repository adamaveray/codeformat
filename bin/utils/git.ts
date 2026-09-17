import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import type { ExitCode } from './types.ts';

import { EXIT_CODE_OK } from './processes.ts';

/** The maximum bytes of output to accept from Git (aiming to be virtually impossible to fill). */
const maximumOutputBytes = 2 ** 26; // oxlint-disable-line no-magic-numbers -- Defining a constant.

export class GitError extends Error {
  public readonly directory: string;

  constructor(message: string, { directory, ...options }: ErrorOptions & { directory: string }) {
    super(`${message} (in "${directory}")`, options);
    this.directory = directory;
    this.name = 'GitError';
  }
}

export interface StagedFiles {
  /** Directory-relative paths of every staged file present in the working tree. */
  readonly files: readonly string[];
  /** Directory-relative paths of staged files no longer present in the working tree. */
  readonly missingPaths: readonly string[];
}

/**
 * @param args The arguments to pass to Git.
 * @param directory The directory to run within.
 * @returns The exit status & standard output of the command.
 * @throws {GitError} If Git could not be run at all.
 */
function gitExec(args: readonly string[], directory: string): { status: ExitCode; stdout: string } {
  // Remove current-environment Git directory options
  const env = { ...process.env };
  delete env['GIT_DIR'];
  delete env['GIT_WORK_TREE'];

  const result = spawnSync('git', args, {
    cwd: directory,
    env,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: maximumOutputBytes,
  });

  if (result.error != null) {
    const { code } = result.error as NodeJS.ErrnoException;
    throw new GitError(
      `Could not run Git: ${
        code === 'ENOENT' ? `the command was not found, or the directory does not exist.` : result.error.message
      }`,
      { directory, cause: result.error },
    );
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout,
  };
}

/**
 * @param directory The directory to read the staged files of.
 * @returns The files staged in the directory’s repository (relative to the directory).
 * @throws {GitError} If the directory is not within a repository.
 * @throws {GitError} If Git could not be run.
 */
export function getStagedFiles(directory: string): StagedFiles {
  const rootPath = path.resolve(directory);

  // Validate repository
  if (gitExec(['rev-parse', '--show-toplevel'], rootPath).status !== EXIT_CODE_OK) {
    throw new GitError(`Not a Git repository.`, { directory });
  }

  const { stdout } = gitExec(
    [
      'diff',
      '--cached',
      '--name-only',
      '--diff-filter=ACMR', // Exclude staged deletions & unmerged paths
      '--relative', // Restrict to specified directory & output paths relative to it
      '-z', // Preserve filenames verbatim
    ],
    rootPath,
  );

  const files: string[] = [];
  const missingPaths: string[] = [];
  for (const relativePath of stdout.split('\0')) {
    if (relativePath === '') {
      continue;
    }

    const stats = statSync(path.resolve(rootPath, relativePath), { throwIfNoEntry: false });
    if (stats == null) {
      missingPaths.push(relativePath);
      continue;
    }
    if (stats.isFile()) {
      files.push(relativePath);
      continue;
    }

    // Non-lintable resource (e.g. staged submodule) - ignore
  }

  return { files, missingPaths };
}
