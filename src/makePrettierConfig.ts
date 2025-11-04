/* eslint sort-keys: "error" -- Organise rules */
/* eslint unicorn/no-useless-spread: "off" -- Keep the basic settings together. */

import type { Config } from 'prettier';

interface Plugins {
  ini?: boolean;
  php?: boolean;
  xml?: boolean;
}

/**
 * @param root1 Included plugins to enable.
 * @param root2 Project-specific customisations.
 * @returns The complete Prettier config.
 */
export default function makePrettierConfig(
  { ini = false, php = false, xml = false }: Plugins = {},
  { plugins = [], overrides = [], ...config }: Config = {},
): Config {
  if (ini) {
    plugins.push('prettier-plugin-ini');
  }
  if (php) {
    plugins.push('@prettier/plugin-php');
  }
  if (xml) {
    plugins.push('@prettier/plugin-xml');
  }
  return {
    ...{
      arrowParens: 'always',
      plugins,
      proseWrap: 'never',
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
    },
    overrides: [
      {
        files: ['**/*.yml', '**/*.yaml'],
        options: { proseWrap: 'preserve' }, // Prevents Prettier bug (https://github.com/prettier/prettier/issues/10776)
      },
      ...overrides,
    ],
    ...config,
  };
}
