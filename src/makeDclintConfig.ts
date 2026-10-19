import type { DCLinter } from 'dclint';

import ruleset from '../rulesets/dclint.ts';

type Config = Partial<ConstructorParameters<typeof DCLinter>[0]>;

type Options = Pick<Config, 'exclude' | 'rules'>;

export default function makeDclintConfig({ exclude = [], rules = {} }: Partial<Options> = {}): Config {
  return {
    exclude: ['vendor', ...exclude],
    rules: { ...ruleset, ...rules },
  } satisfies Config;
}
