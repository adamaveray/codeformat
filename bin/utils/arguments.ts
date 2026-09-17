export interface LimitsConfiguration {
  /** The maximum bytes permitted in a single process call. */
  readonly maximumBytes: number;
  /** Whether the environment values count towards the maximum bytes. */
  readonly includesEnvironment: boolean;
  /** How much to divide the available bytes by. */
  readonly bytesDivisor: number;
}

const argumentTerminatorSize = 1;

export type ArgumentEnvironment = Readonly<Record<string, string | undefined>>;

function getArgumentBytes(value: string): number {
  return Buffer.byteLength(value) + argumentTerminatorSize;
}

/**
 * @param values Strings passed to a process as separate entries.
 * @returns Their combined byte size, counting the terminator each entry carries.
 */
function getTotalBytes(values: Iterable<string>): number {
  let total = 0;
  for (const value of values) {
    total += getArgumentBytes(value);
  }
  return total;
}

/**
 * @param fixedArguments The arguments an invocation carries whichever values are appended to them.
 * @param context The platform & environment the invocation will run under.
 * @param buffer A number of bytes to reserve below the maximum.
 * @returns The room left over for the values.
 */
export function calculateRemainingArgumentBytes(
  fixedArguments: readonly string[],
  { maximumBytes, bytesDivisor, includesEnvironment }: LimitsConfiguration,
  environment: ArgumentEnvironment,
  buffer: number = 0,
): number {
  const environmentBytes = includesEnvironment
    ? getTotalBytes(Object.entries(environment).map(([key, value]) => `${key}=${value ?? ''}`))
    : 0;

  const remainingBytes = maximumBytes - environmentBytes - buffer - getTotalBytes(fixedArguments);

  return Math.floor(remainingBytes / bytesDivisor);
}

/**
 * @param values The values to divide between invocations.
 * @param maxBytes The maximum number of bytes allowed per batch.
 * @param maxCount The maximum number of arguments allowed per batch.
 * @yields The values for each invocation, in the order given. A value exceeding the whole budget is yielded on its own.
 */
export function* createArgumentBatches(
  values: readonly string[],
  maxBytes: number,
  maxCount: number,
): Iterable<readonly string[]> {
  let batch: string[] = [];
  let batchBytes = 0;

  for (const value of values) {
    const valueBytes = getArgumentBytes(value);
    if (batch.length > 0) {
      // Within batch
      if (batchBytes + valueBytes > maxBytes || batch.length >= maxCount) {
        // Adding value will exceed batch size - start new batch
        yield batch;
        batch = [];
        batchBytes = 0;
      }
    }

    // Add to current batch
    batch.push(value);
    batchBytes += valueBytes;
  }

  if (batch.length > 0) {
    yield batch;
  }
}
