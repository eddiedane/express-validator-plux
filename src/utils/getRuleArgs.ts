import { FieldRule } from '../types';
import { getDefaultArg } from './getDefaultArg';
import { getRuleName } from './getRuleName';

export const getRuleArgs = (rule: FieldRule, spreadable: boolean = false) => {
  const ruleName = getRuleName(rule);

  if (!ruleName) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let args: any;

  if (Array.isArray(rule)) {
    args = rule[1] || [];
  } else {
    args = [];
  }

  if (spreadable) args = Array.isArray(args) ? args : [args];

  return Array.isArray(args)
    ? args.length
      ? args
      : getDefaultArg(ruleName)
    : args || [];
};
