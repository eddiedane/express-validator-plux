/* eslint-disable @typescript-eslint/no-explicit-any */

import { sentenceCase } from 'change-case';
import { get } from 'lodash';

import { ValidatorHandler } from '../../types';
import { required } from '../../utils';

export function requiredWhen(
  field: string,
  values: string | [string, ...string[]],
): ValidatorHandler {
  const matchingValues = typeof values === 'string' ? [values] : values;

  return async (val: string | number, { req, location, path }) => {
    const fieldValue = get(req[location], field);
    const match = matchingValues.includes(fieldValue);

    if (match && val == null) {
      required({ req, path, location });
      return Promise.reject(
        `${sentenceCase(path)} is required when "${
          field || 'value'
        }" is "${fieldValue}"`,
      );
    }

    return true;
  };
}
