/* eslint sort-keys: "error" -- Organise rules */

import type { Config } from 'prettier';

/**
 * @param config Project-specific customisations.
 * @returns The complete Prettier config.
 */
export default function makePrettierConfig(config: Config = {}): Config {
  return {
    arrowParens: 'always',
    proseWrap: 'never',
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    ...config,
  };
}
