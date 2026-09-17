import type { ArgumentEnvironment, LimitsConfiguration } from './arguments.ts';
import type { NonEmptyArray } from './types.ts';

import { createArgumentBatches, calculateRemainingArgumentBytes } from './arguments.ts';

/* oxlint-disable no-magic-numbers -- Defining constants. */
export const platformLimitsConfigurations: Readonly<Record<'posix' | 'windows', LimitsConfiguration>> = {
  posix: {
    maximumBytes: 2 ** 20, // Match macOS’s lower minimum than Linux
    includesEnvironment: true,
    bytesDivisor: 2,
  },
  windows: {
    maximumBytes: 8_000, // Fit below `cmd.exe` ~8,191-character limit
    includesEnvironment: false,
    bytesDivisor: 1,
  },
};
/* oxlint-enable no-magic-numbers -- Defining constants. */

export interface Batch<T> {
  readonly index: number;
  readonly values: T;
  readonly totalBatches: number;
}

export default class ExecutionBatcher {
  private readonly remainingBytes: number;

  /**
   * @param command The command and arguments to be executed.
   * @param environment The environment the command will be executed with.
   * @param limits The limits for the environment the command will be executed in.
   * @param maximumBatchArguments The maximum number of arguments per batch regardless of total bytes.
   * @param bytesBuffer See {@link calculateRemainingArgumentBytes}
   */
  constructor(
    private readonly command: NonEmptyArray<string>,
    environment: ArgumentEnvironment,
    limits: LimitsConfiguration,
    private readonly maximumBatchArguments: number,
    bytesBuffer: number = 0,
  ) {
    this.remainingBytes = calculateRemainingArgumentBytes(this.command, limits, environment, bytesBuffer);
  }

  public *batch<T>(
    args: readonly string[],
    transformer: (batchArgs: readonly string[]) => T | undefined,
  ): Iterable<Batch<T>> {
    const batches = [...createArgumentBatches(args, this.remainingBytes, this.maximumBatchArguments)]
      .map((values) => transformer(values))
      .filter((value) => value != null);

    const totalBatches = batches.length;
    for (const [index, values] of batches.entries()) {
      yield { index, values, totalBatches };
    }
  }

  public static createForPlatform(
    platform: NodeJS.Platform,
    command: NonEmptyArray<string>,
    environment: ArgumentEnvironment,
    maximumBatchArguments: number,
    bytesBuffer?: number,
  ): ExecutionBatcher {
    return new ExecutionBatcher(
      command,
      environment,
      platformLimitsConfigurations[platform === 'win32' ? 'windows' : 'posix'],
      maximumBatchArguments,
      bytesBuffer,
    );
  }
}
