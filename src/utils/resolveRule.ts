import { FieldRule, FieldRuleTuple } from "../types";
import { getDefaultArg } from "./getDefaultArg";

export const resolveRule = (rule: FieldRule): FieldRuleTuple | CallableFunction => {
  if (typeof rule === "string") {
    const parts = rule.split(":");
    const ruleName = parts[0].trim();
    const argsStr = (parts[1] || "").trim();

    let args = getDefaultArg(ruleName);

    if (argsStr) {
      args = argsStr.split(/\s*,\s*/);
    }

    return [ruleName, args];
  } else if (Array.isArray(rule)) {
    return rule;
  }

  return rule;
};
