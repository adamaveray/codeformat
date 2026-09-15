import type { Config, CustomSyntax, Plugin } from 'stylelint';

import postcssHtml from 'postcss-html';
import postcssScss from 'postcss-scss';
import * as postcssStyled from 'postcss-styled-syntax';
import orderPlugin from 'stylelint-order';
import defensiveCssPlugins from 'stylelint-plugin-defensive-css';
import scssPlugin from 'stylelint-scss';

import rulesets from '../rulesets/stylelint.ts';
import extensions from './extensions.ts';

type ConfigRules = NonNullable<Config['rules']>;
type ConfigOverrides = NonNullable<Config['overrides']>;
type ConfigOverride = ConfigOverrides[number];

export type EmbeddedStylesContentType = 'css-in-js' | 'html';

type RulesetType = keyof typeof rulesets;

const embeddedTypeExtensions = {
  'css-in-js': [...extensions.jsx, ...extensions.tsx],
  html: [...extensions.html, ...extensions.htmlLike],
} as const satisfies Record<EmbeddedStylesContentType, readonly string[]>;

const embeddedTypeDefaults: Record<EmbeddedStylesContentType, boolean> = {
  'css-in-js': true,
  html: true,
};

/** Stylelint does not support glob braces, so creates a series of glob patterns to simulate them. */
function makeGlobs(fileExtensions: readonly string[]): string[] {
  return fileExtensions.map((ext) => `**/*.${ext}`);
}

interface Options {
  /** Content types to lint CSS within. */
  embeddedTypes?: Partial<Record<EmbeddedStylesContentType, boolean>>;
  /** Additional file patterns to exclude from linting. */
  ignoreFiles?: readonly string[];
  /** Additional overrides, appended after the built-in ones. */
  overrides?: NonNullable<Config['overrides']>;
  /** Additional plugins to load. */
  plugins?: readonly (Plugin | string)[];
  /** Additional syntax-specific rules to merge. */
  rules?: Partial<Record<RulesetType, ConfigRules>>;
}

function loadEmbeddedTypesConfig(
  types: Record<EmbeddedStylesContentType, boolean>,
  scssRules: ConfigRules,
): {
  overrides: ConfigOverrides;
  ignoreFiles: string[];
} {
  const overrides: ConfigOverrides = [];
  const ignoreFiles: string[] = [];

  const processType = (
    type: EmbeddedStylesContentType,
    syntax: CustomSyntax,
    config: Omit<ConfigOverride, 'customSyntax' | 'files'>,
  ) => {
    if (types[type]) {
      overrides.push({
        customSyntax: syntax,
        files: makeGlobs(embeddedTypeExtensions[type]),
        ...config,
      });
    } else {
      ignoreFiles.push(...makeGlobs(embeddedTypeExtensions[type]));
    }
  };

  processType('css-in-js', postcssStyled, {});
  processType('html', postcssHtml({ scss: postcssScss }), {
    plugins: [scssPlugin],
    rules: scssRules,
  });

  return { ignoreFiles, overrides };
}

/**
 * @param options Project-specific customisations.
 * @returns The complete Stylelint config.
 */
export default function makeStylelintConfig({
  embeddedTypes = {},
  ignoreFiles = [],
  overrides = [],
  plugins = [],
  rules = {},
}: Options = {}): Config {
  const resolveRules = (types: RulesetType[]): ConfigRules => {
    const resolved: ConfigRules = {};
    for (const type of types) {
      Object.assign(resolved, { ...rulesets[type], ...rules[type] });
    }
    return resolved;
  };

  const { overrides: embeddedTypeOverrides, ignoreFiles: embeddedTypeIgnoreFiles } = loadEmbeddedTypesConfig(
    { ...embeddedTypeDefaults, ...embeddedTypes },
    resolveRules(['scss', 'embeddedScss']),
  );

  return {
    defaultSeverity: 'error',
    ignoreFiles: ['**/*.min.*', ...embeddedTypeIgnoreFiles, ...ignoreFiles],
    languageOptions: { directionality: { block: 'top-to-bottom', inline: 'left-to-right' } },
    plugins: [...defensiveCssPlugins, orderPlugin, ...plugins],
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    reportUnscopedDisables: true,
    rules: resolveRules(['css']),

    /* oxlint-disable eslint/sort-keys -- Logically positioned. */
    overrides: [
      {
        customSyntax: postcssScss,
        files: makeGlobs(extensions.scss),
        plugins: [scssPlugin],
        rules: resolveRules(['scss']),
      },
      ...embeddedTypeOverrides,
      ...overrides,
    ],
    /* oxlint-enable eslint/sort-keys */
  } satisfies Config;
}
