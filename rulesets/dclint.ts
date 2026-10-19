import type { DCLinter } from 'dclint';

type Config = ConstructorParameters<typeof DCLinter>[0];
type Rules = Config['rules'];
type RuleLevel = Rules[keyof Rules] & number;

// oxlint-disable-next-line no-magic-numbers -- Matching value from library.
const error = 2 as const satisfies RuleLevel;

export default {
  'no-build-and-image': error,
  'no-duplicate-container-names': error,
  'no-duplicate-exported-ports': error,
  'no-quotes-in-volumes': error,
  'no-unbound-port-interfaces': error,
  'no-version-field': error,
  'require-project-name-field': error,
  'require-quotes-in-ports': [error, { quoteType: 'single' }], // Match oxfmt
  'service-container-name-regex': error,
  'service-dependencies-alphabetical-order': error,
  'service-image-require-explicit-tag': error,
  'service-keys-order': error,
  'service-ports-alphabetical-order': error,
  'services-alphabetical-order': error,
  'top-level-properties-order': error,
} as const satisfies Rules;
