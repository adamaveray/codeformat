/* oxlint-disable no-magic-numbers -- Exit codes read more clearly inline. */

import process from 'node:process';
import { describe, expect, it } from 'vite-plus/test';

import Cli from './Cli.ts';

function makeCli(): Cli {
  return new Cli('test', process.cwd(), {
    verbose: false,
    debug: false,
    help: false,
    cache: false,
    cacheDir: '.cache',
    staged: false,
  });
}

/** @returns Arguments to pass to `runSubprocess` to run the given source in a subprocess. */
function buildSubprocessExec(source: string): readonly [execPath: string, args: readonly string[]] {
  return [process.execPath, ['-e', source]];
}

describe(Cli, () => {
  describe('runSubprocess', () => {
    it.for([
      ['succeeds', /* language=JavaScript */ 'process.exit(0)', 0],
      ['fails', /* language=JavaScript */ 'process.exit(4)', 4],
    ] as const satisfies readonly (readonly [label: string, source: string, exitCode: number])[])(
      'returns the exit code when the command %s',
      async ([, source, exitCode]) => {
        const output = makeCli().runSubprocess(...buildSubprocessExec(source));
        await expect(output).resolves.toBe(exitCode);
      },
    );

    it('translates a terminating signal into an exit code', async () => {
      const source = /* language=JavaScript */ 'process.kill(process.pid, "SIGTERM"); setTimeout(() => {}, 1_000)';
      const output = makeCli().runSubprocess(...buildSubprocessExec(source));
      await expect(output).resolves.toBe(143);
    });

    it('rejects when the command cannot be run at all', async () => {
      const output = makeCli().runSubprocess('codeformat-no-such-command', []);
      await expect(output).rejects.toThrow(/^Failed to run/v);
    });
  });

  describe('captureSubprocess', () => {
    it('returns the standard output & exit code', async () => {
      const source = /* language=JavaScript */ 'process.stdout.write("captured"); process.exit(3)';
      const output = makeCli().captureSubprocess(...buildSubprocessExec(source));
      await expect(output).resolves.toStrictEqual({ exitCode: 3, stdout: 'captured' });
    });

    it('captures output spanning multiple chunks', async () => {
      const length = 512 * 1_024;
      const source = /* language=JavaScript */ `process.stdout.write("x".repeat(${length}))`;
      const { stdout } = await makeCli().captureSubprocess(...buildSubprocessExec(source));
      expect(stdout).toHaveLength(length);
    });

    it('leaves standard error uncaptured, so failures stay visible', async () => {
      const source = /* language=JavaScript */ 'process.stderr.write("diagnostic"); process.stdout.write("data")';
      const { stdout } = await makeCli().captureSubprocess(...buildSubprocessExec(source));
      expect(stdout).toBe('data');
    });

    it('returns empty output for a command writing nothing', async () => {
      const source = /* language=JavaScript */ 'process.exit(0)';
      const output = makeCli().captureSubprocess(...buildSubprocessExec(source));
      await expect(output).resolves.toStrictEqual({ exitCode: 0, stdout: '' });
    });
  });
});
