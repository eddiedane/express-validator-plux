import { sentenceCase } from 'sentence-case';
import pluralize from 'pluralize';
import { LimitRuleValue, ValidatorRuleFactory } from '../types';

export const min: ValidatorRuleFactory<LimitRuleValue> = ({
  data: min,
  msg,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (val: any, { req, path }) => {
    min = typeof min === 'function' ? min(req, { path }) : min;
    min = Number(min);
    if (typeof val === 'number') {
      return Number(val) < min
        ? Promise.reject(
            msg || `${sentenceCase(path)} must not be less than ${min}`,
          )
        : true;
    }
    if (Array.isArray(val)) {
      return val.length < min
        ? Promise.reject(
            msg ||
              `${sentenceCase(path)} must contain atleast ${min} ${pluralize(
                'item',
                min,
              )}`,
          )
        : true;
    }
    if (typeof val === 'string') {
      return val.length < min
        ? Promise.reject(
            msg ||
              `${sentenceCase(path)} must be contain atleast ${min} ${pluralize(
                'character',
                min,
              )}`,
          )
        : true;
    }

    return true;
  };
};
