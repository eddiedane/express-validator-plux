import { FieldRule, Fields } from '../types';

export const getCopyFieldRules = (
  fieldKey: string,
  fields: Fields,
): boolean | FieldRule[] => {
  const rules = fields[fieldKey];

  if (typeof rules !== 'string') return rules;

  const copyFieldKey = rules;

  if (!(copyFieldKey in fields)) {
    throw new Error(`"${copyFieldKey}" not found, and can't be copied.`);
  }

  const copyFieldRules = fields[copyFieldKey];

  if (typeof copyFieldRules === 'string') {
    const nextCopyFieldKey = copyFieldRules;
    return getCopyFieldRules(nextCopyFieldKey, fields);
  }

  return copyFieldRules;
};
