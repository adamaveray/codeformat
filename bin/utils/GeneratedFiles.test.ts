/* oxlint-disable no-magic-numbers -- Build counts read more clearly inline. */

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, onTestFinished } from 'vite-plus/test';

import type { GeneratedFileLocation } from './GeneratedFiles.ts';

import GeneratedFiles from './GeneratedFiles.ts';
import Output from './Output.ts';

const projectScratch = { kind: 'projectScratch', extension: 'ignore' } as const satisfies GeneratedFileLocation;
const scratch = { kind: 'scratch', extension: 'json' } as const satisfies GeneratedFileLocation;
const projectFile = { kind: 'projectFile', fileName: '.tool-ignore' } as const satisfies GeneratedFileLocation;

function makeProject(): { directory: string; files: GeneratedFiles } {
  const directory = mkdtempSync(path.join(tmpdir(), 'codeformat-generated-'));
  const files = new GeneratedFiles(directory, new Output('test', { debug: false, verbose: false }));
  onTestFinished(() => {
    files.cleanUp();
    rmSync(directory, { recursive: true });
  });
  return { directory, files };
}

describe(GeneratedFiles, () => {
  describe('writing', () => {
    it.for([
      ['projectScratch', projectScratch],
      ['projectFile', projectFile],
    ] as const satisfies readonly (readonly [label: string, location: GeneratedFileLocation])[])(
      'writes %s into the project & references it relatively',
      async ([, location]) => {
        const { directory, files } = makeProject();
        const reference = await files.create('id', location, () => 'contents');

        expect(path.isAbsolute(reference)).toBe(false);
        expect(readFileSync(path.resolve(directory, reference), 'utf8')).toBe('contents');
      },
    );

    it('writes scratch files outside the project & references them absolutely', async () => {
      const { directory, files } = makeProject();
      const reference = await files.create('id', scratch, () => 'contents');

      expect(path.isAbsolute(reference)).toBe(true);
      expect(reference.startsWith(directory)).toBe(false);
      expect(readFileSync(reference, 'utf8')).toBe('contents');
    });

    it('gives each file a distinct name', async () => {
      const { files } = makeProject();
      const first = await files.create('first', projectScratch, () => 'a');
      const second = await files.create('second', projectScratch, () => 'b');

      expect(first).not.toBe(second);
    });
  });

  describe('sharing', () => {
    it('builds once for a repeated id', async () => {
      const { files } = makeProject();
      let buildCount = 0;
      const build = (): string => {
        buildCount += 1;
        return 'contents';
      };

      const first = await files.create('shared', scratch, build);
      const second = await files.create('shared', scratch, build);

      expect(second).toBe(first);
      expect(buildCount).toBe(1);
    });

    it('builds again for a differing id', async () => {
      const { files } = makeProject();
      let buildCount = 0;
      const build = (): string => {
        buildCount += 1;
        return 'contents';
      };

      await files.create('one', scratch, build);
      await files.create('two', scratch, build);

      expect(buildCount).toBe(2);
    });
  });

  describe('preserving existing files', () => {
    it('appends to a project file & restores its contents', async () => {
      const { directory, files } = makeProject();
      const filePath = path.resolve(directory, projectFile.fileName);
      writeFileSync(filePath, 'existing\n');

      await files.create('id', projectFile, () => 'generated\n');
      expect(readFileSync(filePath, 'utf8')).toBe('existing\ngenerated\n');

      files.cleanUp();
      expect(readFileSync(filePath, 'utf8')).toBe('existing\n');
    });

    it('separates appended contents from a file with no trailing newline', async () => {
      const { directory, files } = makeProject();
      const filePath = path.resolve(directory, projectFile.fileName);
      writeFileSync(filePath, 'existing');

      await files.create('id', projectFile, () => 'generated\n');
      expect(readFileSync(filePath, 'utf8')).toBe('existing\ngenerated\n');
    });

    it('does not prepend anything to an empty project file', async () => {
      const { directory, files } = makeProject();
      const filePath = path.resolve(directory, projectFile.fileName);
      writeFileSync(filePath, '');

      await files.create('id', projectFile, () => 'generated\n');
      expect(readFileSync(filePath, 'utf8')).toBe('generated\n');
    });
  });

  describe('process handlers', () => {
    it.for(['exit', 'SIGINT', 'SIGTERM', 'SIGHUP'] as const satisfies readonly ('exit' | NodeJS.Signals)[])(
      'handles %s only while a file is outstanding',
      async (event) => {
        const initialCount = process.listenerCount(event);
        const { files } = makeProject();
        expect(process.listenerCount(event)).toBe(initialCount);

        await files.create('id', scratch, () => 'contents');
        expect(process.listenerCount(event)).toBe(initialCount + 1);

        files.cleanUp();
        expect(process.listenerCount(event)).toBe(initialCount);
      },
    );

    it('handles each event once for repeated files', async () => {
      const initialCount = process.listenerCount('exit');
      const { files } = makeProject();

      await files.create('first', scratch, () => 'a');
      await files.create('second', scratch, () => 'b');

      expect(process.listenerCount('exit')).toBe(initialCount + 1);
    });
  });

  describe('cleaning up', () => {
    it.for([
      ['projectScratch', projectScratch],
      ['scratch', scratch],
    ] as const satisfies readonly (readonly [label: string, location: GeneratedFileLocation])[])(
      'removes the %s file it created',
      async ([, location]) => {
        const { directory, files } = makeProject();
        const reference = await files.create('id', location, () => 'contents');
        const filePath = path.resolve(directory, reference);
        expect(existsSync(filePath)).toBe(true);

        files.cleanUp();
        expect(existsSync(filePath)).toBe(false);
      },
    );

    it('removes a project file that did not exist beforehand', async () => {
      const { directory, files } = makeProject();
      await files.create('id', projectFile, () => 'generated\n');
      const filePath = path.resolve(directory, projectFile.fileName);
      expect(existsSync(filePath)).toBe(true);

      files.cleanUp();
      expect(existsSync(filePath)).toBe(false);
    });

    it('removes the scratch directory', async () => {
      const { files } = makeProject();
      const reference = await files.create('id', scratch, () => 'contents');

      files.cleanUp();
      expect(existsSync(path.dirname(reference))).toBe(false);
    });

    it('can be called repeatedly', async () => {
      const { files } = makeProject();
      await files.create('id', projectScratch, () => 'contents');

      files.cleanUp();
      expect(() => {
        files.cleanUp();
      }).not.toThrow();
    });

    it('builds again after cleaning up', async () => {
      const { files } = makeProject();
      let buildCount = 0;
      const build = (): string => {
        buildCount += 1;
        return 'contents';
      };

      await files.create('shared', scratch, build);
      files.cleanUp();
      await files.create('shared', scratch, build);

      expect(buildCount).toBe(2);
    });

    it('leaves nothing behind when building throws', async () => {
      const { directory, files } = makeProject();
      const error = new Error('Could not build.');

      await expect(
        files.create('id', projectScratch, () => {
          throw error;
        }),
      ).rejects.toThrow(error);

      expect(existsSync(path.resolve(directory, projectFile.fileName))).toBe(false);
    });
  });
});
