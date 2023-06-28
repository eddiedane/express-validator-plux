import { FieldRule } from '../types';

export const prioritizeNullable = (rules: FieldRule[]): FieldRule[] => {
  let _rules = [...rules];
  const index = _rules.findIndex((rule) => rule === 'nullable');

  if (index > 0) {
    const nullableRule = rules.splice(index, 1);
    _rules = nullableRule.concat(nullableRule);
  }

  return _rules;
};
