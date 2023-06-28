import { Obj } from "../types";

export function customRules(rules: Obj, wrap: boolean = false) {
  const _rules: Obj = {};

  for (const ruleKey in rules) {
    const rule = rules[ruleKey];
    const ruleName = rule.id || rule.name;

    _rules[ruleName] = wrap ? () => rule : rule;
  }

  return _rules;
}
