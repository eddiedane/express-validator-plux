/* eslint-disable @typescript-eslint/no-explicit-any */

import { sentenceCase } from 'change-case';
import { Request } from 'express';
import { get } from 'lodash';

import { ValidatorHandler } from '../types';
import { required } from '../utils';

export type RequiredWhenOptions = {
  field?: string;
  values: any[];
  value?: (req: Request) => Promise<any>;
};

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
