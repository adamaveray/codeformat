import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

import type Output from './Output.ts';

import { getExitCodeForSignal } from './processes.ts';

/** Where a generated file must be written for the tool reading it to find it. */
export type GeneratedFileLocation =
  /** A fixed name in the project directory, which the project may already contain. */
  | { readonly kind: 'projectFile'; readonly fileName: string }
  /** A generated name in the project directory, for tools resolving patterns relative to the file itself. */
  | { readonly kind: 'projectScratch'; readonly extension: string }
  /** A generated name outside the project directory. */
  | { readonly kind: 'scratch'; readonly extension: string };

type FileModificationOperation = 'overwrite' | 'append';

interface ResolvedLocation {
  /** The absolute path to the file. */
  readonly filePath: string;
  /** The path to the file its associated tool can use to reference it via. */
  readonly toolPath: string;
  /** How the file should be modified. */
  readonly operation: FileModificationOperation;
}

/** A backup of a file’s content. */
type FileSnapshot = {
  readonly filePath: string;
} & (
  | {
      readonly exists: true;
      readonly contents: Buffer;
    }
  | {
      readonly exists: false;
      readonly contents?: undefined;
    }
);

/** A process event handled only while files are outstanding. */
interface InstalledHandler {
  readonly event: 'exit' | NodeJS.Signals;
  readonly handler: () => void;
}

/** Signals terminating the process without running its exit handlers. */
const terminatingSignals = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const satisfies readonly NodeJS.Signals[];

/** Writes the temporary files tools are given in place of arguments, and guarantees their removal. */
export default class GeneratedFiles {
  private readonly toolPaths = new Map<string, string>();
  private restorations: FileSnapshot[] = [];
  private installedHandlers?: readonly InstalledHandler[];
  private scratchDirectory?: string;
  private nextFileIndex = 0;

  constructor(
    private readonly directory: string,
    private readonly output: Output,
  ) {}

  /**
   * @param id An identifier unique per contents.
   * @param location Where the file must be written to.
   * @param build Produces the contents when not yet created.
   * @returns How the tool can access the file.
   */
  public async create(
    id: string,
    location: GeneratedFileLocation,
    build: () => MaybePromise<string>,
  ): Promise<ResolvedLocation['toolPath']> {
    let toolPath: ResolvedLocation['toolPath'] | undefined = this.toolPaths.get(id);
    if (toolPath == null) {
      // First creation - install handlers
      this.installCleanupHandlers();

      const contents = await build();

      // Write contents
      const resolvedLocation = this.resolveLocation(location);
      toolPath = resolvedLocation.toolPath;
      this.write(resolvedLocation.filePath, contents, resolvedLocation.operation);
      this.output.verbose('Wrote generated tool file:', [toolPath]);
      this.output.debug('Wrote generated file contents:', [resolvedLocation.filePath, contents]);

      this.toolPaths.set(id, toolPath);
    }
    return toolPath;
  }

  /**
   * Removes modifications made to the system.
   */
  public cleanUp(): void {
    // File modifications (reversed to roll back consecutive modifications in order)
    for (const fileState of this.restorations.toReversed()) {
      const { filePath } = fileState;
      try {
        if (fileState.exists) {
          // File existed - restore file
          writeFileSync(filePath, fileState.contents);
        } else {
          // File did not exist - remove
          if (existsSync(filePath)) {
            rmSync(filePath);
          }
        }
      } catch (error) {
        this.output.debug(`Failed cleaning up file "${filePath}".`, [error]);
      }
    }
    this.restorations = [];
    this.toolPaths.clear();

    // Scratch directory
    if (this.scratchDirectory != null) {
      try {
        rmSync(this.scratchDirectory, { recursive: true });
      } catch (error) {
        this.output.debug(`Failed removing temporary directory "${this.scratchDirectory}".`, [error]);
      }
      this.scratchDirectory = undefined;
    }

    // Handlers
    for (const { event, handler } of this.installedHandlers ?? []) {
      process.removeListener(event, handler);
    }
    this.installedHandlers = undefined;
  }

  private installCleanupHandlers(): void {
    if (this.installedHandlers != null) {
      return;
    }

    const handlers: readonly InstalledHandler[] = [
      {
        event: 'exit',
        handler: () => {
          this.cleanUp();
        },
      },
      ...terminatingSignals.map((signal) => {
        const exitCode = getExitCodeForSignal(signal);
        return {
          event: signal,
          handler: () => {
            this.cleanUp();
            process.exit(exitCode);
          },
        };
      }),
    ];

    for (const { event, handler } of handlers) {
      process.once(event, handler);
    }
    this.installedHandlers = handlers;
  }

  private resolveLocation(location: GeneratedFileLocation): ResolvedLocation {
    switch (location.kind) {
      case 'projectFile': {
        return {
          filePath: path.resolve(this.directory, location.fileName),
          toolPath: location.fileName,
          operation: 'append',
        };
      }

      case 'projectScratch': {
        const fileName = this.buildFileName(location.extension);
        return {
          filePath: path.resolve(this.directory, fileName),
          toolPath: fileName,
          operation: 'overwrite',
        };
      }

      case 'scratch': {
        this.scratchDirectory ??= mkdtempSync(path.join(tmpdir(), 'codeformat-'));
        const filePath = path.join(this.scratchDirectory, this.buildFileName(location.extension));
        return {
          filePath,
          toolPath: filePath,
          operation: 'overwrite',
        };
      }
    }
  }

  /** @returns A name identifying both this process & this file, so leftovers can be told apart. */
  private buildFileName(extension: string): string {
    this.nextFileIndex += 1;
    return `.codeformat-${process.pid}-${this.nextFileIndex}.${extension}`;
  }

  private write(filePath: string, contents: string, operation: FileModificationOperation): void {
    // Record snapshot for restoration
    const snapshot: FileSnapshot = existsSync(filePath)
      ? { filePath, exists: true, contents: readFileSync(filePath) }
      : { filePath, exists: false };
    this.restorations.push(snapshot);

    // Update file
    let newContents: string;
    switch (operation) {
      case 'overwrite': {
        newContents = contents;
        break;
      }

      case 'append': {
        const prefix =
          snapshot.exists && snapshot.contents.length > 0
            ? snapshot.contents.toString('utf8').replace(/\n?$/v, '\n')
            : '';
        newContents = prefix + contents;
        break;
      }
    }
    writeFileSync(filePath, newContents);
  }
}
