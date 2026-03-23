/** Severity level for an Oxlint rule. */
type OxlintSeverity = 'off' | 'warn' | 'error';

/** An Oxlint rule value: either a severity string, or a tuple of severity and options. */
type OxlintRuleValue = OxlintSeverity | [OxlintSeverity, ...unknown[]];

/** A record of Oxlint rule names to their configurations. */
export type OxlintRules = Record<string, OxlintRuleValue>;
