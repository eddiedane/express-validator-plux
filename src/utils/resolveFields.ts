import { FieldRule, Fields, FieldsRuleList } from "../types";
import { getCopyFieldRules } from "./getCopyFieldRules";
import { prioritizeNullable } from "./prioritizeNullable";
import { resolveRule } from "./resolveRule";

export const resolveFields = (fields: Fields): FieldsRuleList => {
  const fieldKeys = Object.keys(fields);
  const _fields: FieldsRuleList = {};

  fieldKeys.forEach((fieldKey: string) => {
    _fields[fieldKey] = prioritizeNullable(resolveBool(getCopyFieldRules(fieldKey, fields))).map(
      (rule) => resolveRule(rule),
    );
  });

  return _fields;
};

function resolveBool(rules: boolean | FieldRule[]) {
  return typeof rules === "boolean" ? (rules ? ["notEmpty"] : ["optional"]) : rules;
}
