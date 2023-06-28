import { FieldRule } from '../types';

export const getRuleName = (rule: FieldRule): string | undefined => {
  return Array.isArray(rule)
    ? rule[0]
    : typeof rule === 'function'
    ? undefined
    : rule;
};
