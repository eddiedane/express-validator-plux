import { Obj } from '../types';

export const getDefaultArg = (ruleName: string) => {
  const defaultArgs: Obj = {
    isPostalCode: 'any',
    optional: { nullable: true, checkFalsy: false },
  };

  return defaultArgs[ruleName] || [];
};
