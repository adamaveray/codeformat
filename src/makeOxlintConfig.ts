import type { OxlintRules } from '../rulesets/types.ts';

import { findFirstFile } from '../bin/utils/filesystem.ts';
import rulesetOxlintJsx from '../rulesets/oxlint/ruleset-jsx.ts';
import rulesetOxlintShared from '../rulesets/oxlint/ruleset-shared.ts';
import rulesetOxlintTypescript, {
  moduleDeclarations as rulesetOxlintTypescriptModuleDeclarations,
} from '../rulesets/oxlint/ruleset-typescript.ts';
import extensions from './extensions.ts';

interface Options {
  /** The absolute path to the project's root. */
  rootPath?: string;
  /** The relative path to the project's `tsconfig.json` file. */
  tsconfigPath?: string;
  /** Whether the project uses the Bun runtime. */
  isBun?: boolean;
}

export interface OxlintConfig {
  $schema?: string;
  options?: Record<string, unknown>;
  plugins: string[];
  categories: Record<string, string>;
  env: Record<string, boolean>;
  globals?: Record<string, string>;
  rules: OxlintRules;
  overrides: OxlintOverride[];
  ignorePatterns: string[];
  settings?: Record<string, unknown>;
}

interface OxlintOverride {
  files: string[];
  rules: OxlintRules;
  plugins?: string[];
}

/**
 * @param options Project-specific customisations.
 * @returns The complete Oxlint config.
 */
export default function makeOxlintConfig({
  rootPath = process.cwd(),
  tsconfigPath,
  isBun,
}: Options = {}): OxlintConfig {
  isBun ??= findFirstFile(rootPath, ['bun.lock', 'bunfig.toml']) != null;

  return {
    $schema: './node_modules/oxlint/configuration_schema.json',

    options: {
      typeAware: true,
      typeCheck: true,
    },

    plugins: ['typescript', 'unicorn', 'import', 'jsdoc', 'promise', 'jsx-a11y', 'react'],

    categories: {
      correctness: 'error',
      suspicious: 'error',
      pedantic: 'off',
      perf: 'error',
      style: 'off',
      restriction: 'off',
      nursery: 'off',
    },

    env: {
      browser: true,
      node: true,
      ...(isBun ? { 'shared-node-browser': true } : {}),
    },

    ignorePatterns: ['**/.DS_Store', '.cache/**/*', '.git/**/*', 'node_modules/**/*'],

    settings: tsconfigPath != null ? { typescript: { project: tsconfigPath } } : {},

    rules: {
      // Shared rules for all JS/TS files
      ...rulesetOxlintShared,
    },

    overrides: [
      // JSX/TSX files
      {
        files: [`**/*.{${[...extensions.jsx, ...extensions.tsx].join(',')}}`],
        rules: rulesetOxlintJsx,
      },

      // TypeScript files
      {
        files: [`**/*.{${extensions.ts.join(',')}}`],
        rules: rulesetOxlintTypescript,
      },

      // Module declaration files
      {
        files: ['**/*.d.ts'],
        rules: rulesetOxlintTypescriptModuleDeclarations,
      },
    ],
  };
}
