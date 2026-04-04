import makeOxlintConfig from './src/makeOxlintConfig.ts';

const config = makeOxlintConfig({ tsconfigPath: './tsconfig.json' });

// Add Bun global for the CLI
config.globals = { ...config.globals, Bun: 'readonly' };

// Allow useless spreads in ruleset files (keeps unprefixed core rules visually grouped)
config.overrides = [
  ...(config.overrides ?? []),
  {
    files: ['rulesets/**/*.ts', 'src/makePrettierConfig.ts', 'src/makeStylelintConfig.ts'],
    rules: {
      'eslint/sort-keys': 'error',
      'unicorn/no-useless-spread': 'off',
    },
  },
  {
    files: ['bin/**/*.ts'],
    rules: {
      'node/no-process-env': 'off',
      'unicorn/no-process-exit': 'off',
    },
  },
];

export default config;
