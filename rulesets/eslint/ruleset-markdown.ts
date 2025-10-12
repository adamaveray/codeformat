import markdownPlugin from '@eslint/markdown';
import type { TSESLint } from '@typescript-eslint/utils';

function mergeRulesets<T extends Record<string, any>>(entries: { rules: T }[]): T {
  const merged = {} as T;
  for (const { rules } of entries) {
    Object.assign(merged, rules);
  }
  return merged;
}

export default {
  ...mergeRulesets(markdownPlugin.configs.recommended),
} as const satisfies TSESLint.FlatConfig.Rules;
