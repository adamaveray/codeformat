import type { OxlintConfig } from 'vite-plus/lint';

import * as rulesets from '../rulesets/oxlint.ts';
import extensions from './extensions.ts';

const testFilePatterns = [
  '**/__tests__/**',
  '**/test/**',
  '**/tests/**',
  '**/*.{test,spec}.*',
  '**/*.{test,spec}-d.*',
  '**/*.bench.*',
];

interface Options extends Partial<Pick<OxlintConfig, 'env' | 'settings' | 'options' | 'overrides'>> {
  /** Additional file patterns to ignore. */
  ignorePatterns?: readonly string[];
  /** The relative path to the project’s `tsconfig.json` file. */
  tsconfigPath?: string;
}

/**
 * @param options Project-specific customisations.
 * @returns The complete Oxlint config.
 */
export default function makeOxlintConfig({
  tsconfigPath,
  env,
  ignorePatterns = [],
  settings = {},
  options = {},
  overrides = [],
}: Options = {}): OxlintConfig {
  return {
    categories: {
      correctness: 'error',
      pedantic: 'error',
      perf: 'error',
      restriction: 'error',
      style: 'error',
      suspicious: 'error',
    },

    env: {
      browser: true,
      node: true,
      ...env,
    },

    ignorePatterns: ['**/.DS_Store', '.cache/**/*', '.git/**/*', 'node_modules/**/*', ...ignorePatterns],

    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],

    options: {
      denyWarnings: true,
      reportUnusedDisableDirectives: 'error',
      typeAware: true,
      typeCheck: true,
      ...options,
    },

    overrides: [
      // TypeScript files
      {
        files: [`**/*.{${extensions.ts.join(',')}}`],
        rules: rulesets.typescript,
      },

      // Module declaration files
      {
        files: ['**/*.d.ts'],
        rules: rulesets.typescriptModules,
      },

      // Test files
      {
        files: testFilePatterns,
        plugins: ['vitest'],
        rules: rulesets.tests,
      },

      ...overrides,
    ],

    plugins: ['import', 'jsdoc', 'jsx-a11y', 'node', 'oxc', 'promise', 'react', 'typescript', 'unicorn'],

    rules: {
      // Shared rules for all JS/TS files
      ...rulesets.shared,
    },

    settings: {
      typescript: {
        project: tsconfigPath,
        ...(settings['typescript'] as object | undefined),
      },
      ...settings,
    },
  } satisfies OxlintConfig;
}
