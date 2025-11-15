type WarnValue = 'warn' | 1;
type ConvertedValue<T> = T extends WarnValue
  ? 'error'
  : T extends readonly [WarnValue, ...infer TRest]
    ? ['error', ...TRest]
    : T;
type Converted<T> = { [key in keyof T]: ConvertedValue<T[key]> };

type Iterated<T extends Record<any, any>> = Iterable<[keyof T, T[keyof T]], unknown, unknown>;

const isWarning = (value: unknown): value is WarnValue => value === 'warn' || value === 1;

/**
 * Replaces any `warn` values in the provided object with `error` (including those within arrays with configs), preserving all other values.
 *
 * @param ruleset The original ruleset to process.
 * @returns The processed ruleset with warnings replaced with errors.
 * @example
 *   convertWarnsToErrors({
 *     rule1: 'warn',
 *     rule2: ['warn', { foo: 'bar' }],
 *     rule3: 'off',
 *   })
 *   // {
 *   //   rule1: 'error',
 *   //   rule2: ['error', { foo: 'bar' }],
 *   //   rule3: 'off',
 *   // }
 */
export default function convertWarnsToErrors<T extends Record<string, unknown>>(ruleset: T): Converted<T> {
  const rulesetProcessed = {} as Converted<T>;
  for (const [key, value] of Object.entries(ruleset) as Iterated<T>) {
    let processedValue;
    if (Array.isArray(value)) {
      processedValue = [...value];
      processedValue[0] = isWarning(processedValue[0]) ? 'error' : processedValue[0];
    } else {
      processedValue = isWarning(value) ? 'error' : value;
    }
    rulesetProcessed[key] = processedValue as Converted<T>[typeof key];
  }
  return rulesetProcessed;
}
