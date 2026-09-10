import type { OxfmtConfig } from 'vite-plus/fmt';

const MAXIMUM_CHARS = 120;

/**
 * @param config Project-specific customisations.
 * @returns The complete Oxfmt config.
 */
export default function makeOxfmtConfig(config: Readonly<OxfmtConfig> = {}): OxfmtConfig {
  return {
    arrowParens: 'always',
    printWidth: MAXIMUM_CHARS,
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
  } satisfies OxfmtConfig;
}
