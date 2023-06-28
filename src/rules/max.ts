import { sentenceCase } from 'change-case';
import pluralize from 'pluralize';

import { LimitRuleValue, ValidatorRuleFactory } from '../types';

export const max: ValidatorRuleFactory<LimitRuleValue> = ({
  data: max,
  msg,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (val: any, { req, path }) => {
    max = typeof max === 'function' ? max(req, { path }) : max;
    max = Number(max);

    if (typeof val === 'number') {
      return Number(val) > max
        ? Promise.reject(
            msg || `${sentenceCase(path)} must not be greater than ${max}`,
          )
        : true;
    }
    if (Array.isArray(val)) {
      return val.length > max
        ? Promise.reject(
            msg ||
              `${sentenceCase(path)} must contain atmost ${max} ${pluralize(
                'item',
                max,
              )}`,
          )
        : true;
    }
    if (typeof val === 'string') {
      return val.length > max
        ? Promise.reject(
            msg ||
              `${sentenceCase(path)} must be contain atmost ${max} ${pluralize(
                'character',
                max,
              )}`,
          )
        : true;
    }

    return true;
  };
};
