import type { OxlintConfig } from 'vite-plus/lint';

import * as rulesets from '../rulesets/oxlint.ts';
import extensions from './extensions.ts';

interface Options extends Partial<Pick<OxlintConfig, 'env' | 'settings' | 'options' | 'overrides'>> {
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

    ignorePatterns: ['**/.DS_Store', '.cache/**/*', '.git/**/*', 'node_modules/**/*'],

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

      ...overrides,
    ],

    plugins: ['import', 'jsdoc', 'jsx-a11y', 'node', 'oxc', 'promise', 'react', 'typescript', 'unicorn', 'vitest'],

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
