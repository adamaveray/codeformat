import type { OxfmtConfig } from 'oxfmt';

import { defineConfig } from 'oxfmt';

/**
 * @param config Project-specific customisations.
 * @returns The complete Oxfmt config.
 */
export default function makeOxfmtConfig(config: OxfmtConfig = {}): OxfmtConfig {
  return defineConfig({
    arrowParens: 'always',
    printWidth: 120,
    proseWrap: 'never',
    semi: true,
    singleQuote: true,
    sortImports: {
      groups: [
        'type-import',
        ['value-builtin', 'value-external'],
        'type-internal',
        'value-internal',
        ['type-parent', 'type-sibling', 'type-index'],
        ['value-parent', 'value-sibling', 'value-index'],
        'unknown',
      ],
      newlinesBetween: true,
    },
    trailingComma: 'all',
    ...config,
  });
}
