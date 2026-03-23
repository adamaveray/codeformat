interface SortImportsOptions {
  /** Custom grouping for import sorting. */
  groups?: (string | string[])[];
  /** Whether to add newlines between groups. */
  newlinesBetween?: boolean;
}

interface Config {
  $schema?: string;
  arrowParens?: 'always' | 'avoid';
  bracketSameLine?: boolean;
  bracketSpacing?: boolean;
  endOfLine?: 'lf' | 'crlf' | 'cr' | 'auto';
  jsxSingleQuote?: boolean;
  printWidth?: number;
  proseWrap?: 'always' | 'never' | 'preserve';
  quoteProps?: 'as-needed' | 'consistent' | 'preserve';
  semi?: boolean;
  singleQuote?: boolean;
  sortImports?: SortImportsOptions | boolean;
  tabWidth?: number;
  trailingComma?: 'all' | 'es5' | 'none';
  useTabs?: boolean;
}

/**
 * @param config Project-specific customisations.
 * @returns The complete Oxfmt config.
 */
export default function makeOxfmtConfig(config: Config = {}): Config {
  return {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    arrowParens: 'always',
    printWidth: 80,
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
  };
}
