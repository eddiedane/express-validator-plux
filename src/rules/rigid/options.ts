import { sentenceCase } from 'change-case';
import { toNumber } from 'lodash';

import { ValidatorHandler } from '../../types';

type StrNum = string | number;

type AllowRuleObj = {
  label: string;
  value: StrNum;
};

type AllowRuleValue = StrNum | AllowRuleObj;

type Arg = StrNum | AllowRuleValue[] | { [key: string]: AllowRuleValue };

export function options(arg: Arg, ...strNum: StrNum[]): ValidatorHandler {
  let allowed = Array.isArray(arg)
    ? [...arg, ...strNum]
    : typeof arg === 'object'
    ? Object.values(arg)
    : [arg, ...strNum];

  allowed = Array.isArray(allowed[0]) ? allowed[0] : allowed;

  const allowedValues = allowed.map((a) => {
    const val = typeof a === 'object' && a != null ? a.value : a;

    return toNumber(val);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (value: any, { path }) => {
    const isArrayValue = Array.isArray(value);

    const pass = isArrayValue
      ? value.every((v) => {
          return !!~allowedValues.findIndex((a) => a === toNumber(v));
        })
      : !!~allowedValues.findIndex((a) => a === toNumber(value));

    if (!pass) {
      const optionsNameArr = allowed.map((a) => {
        return typeof a === 'object' && a != null
          ? a.label || a.value
          : a == null
          ? 'null'
          : a;
      });

      const optionsName =
        optionsNameArr.length === 1
          ? `'${optionsNameArr.join('')}'`
          : `'${optionsNameArr
              .slice(0, optionsNameArr.length - 1)
              .join("', '")}'` +
            ` or '${optionsNameArr[optionsNameArr.length - 1]}'`;

      return Promise.reject(
        `${sentenceCase(path)} can only ${
          isArrayValue ? 'contain' : 'be'
        } ${optionsName}.`,
      );
    }

    return true;
  };
}
