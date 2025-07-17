/* eslint sort-keys: "error" -- Organise rules */

import type { Config } from 'prettier';

interface Plugins {
  php?: boolean;
  xml?: boolean;
}

/**
 * @param root1 Included plugins to enable.
 * @param root2 Project-specific customisations.
 * @returns The complete Prettier config.
 */
export default function makePrettierConfig(
  { php = false, xml = false }: Plugins = {},
  { plugins = [], ...config }: Config = {},
): Config {
  if (php) {
    plugins.push('@prettier/plugin-php');
  }
  if (xml) {
    plugins.push('@prettier/plugin-xml');
  }
  return {
    arrowParens: 'always',
    plugins,
    proseWrap: 'never',
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    ...config,
  };
}
