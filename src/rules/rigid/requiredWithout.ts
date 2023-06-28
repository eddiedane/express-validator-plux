import { sentenceCase } from 'change-case';
import { get } from 'lodash';
import pluralize from 'pluralize';

import { ValidatorHandler } from '../../types';
import {
  defaultFalsy,
  isEmptyValue,
  join,
  required,
  toNestedKeyArray,
} from '../../utils';

type Options = { falsy?: boolean | CallableFunction };

export const requiredWithout = (
  fields: string[],
  options: Options = { falsy: defaultFalsy },
): ValidatorHandler => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (value: string | number, { req, path, location }) => {
    const data = req[location];
    const paths = toNestedKeyArray(path);
    const labels: string[] = [];

    const fieldsEmpty = fields.every((field) => {
      const fieldPaths = field.split('.').map((path, i) => {
        if (path === '*') return paths[i];
        return path;
      });

      labels.push(fieldPaths.join('.'));

      const fieldValue = get(data, fieldPaths);

      return isEmptyValue(fieldValue, options.falsy);
    });

    value = value == null ? '' : value;

    const valueEmpty =
      typeof value !== 'string' ? false : isEmptyValue(value, options.falsy);

    if (valueEmpty && fieldsEmpty) {
      required({ req, path, location });

      const depFieldStr = join(labels, {
        delimiters: [', ', ' or '],
      }).toLowerCase();

      const verb = pluralize('is', fields.length);
      const defaultMsg = `${sentenceCase(
        path,
      )} is required when ${depFieldStr} ${verb} empty.`;

      return Promise.reject(defaultMsg);
    }

    return true;
  };
};
