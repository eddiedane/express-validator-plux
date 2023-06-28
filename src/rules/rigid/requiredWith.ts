import { sentenceCase } from 'change-case';
import pluralize from 'pluralize';

import { ValidatorHandler } from '../../types';
import { join, required, toNestedKeyArray, traverse } from '../../utils';

export const requiredWith = (fields: string[]): ValidatorHandler => {
  let options: { allowFalsy?: boolean } = {};
  const lastArg = fields[fields.length - 1];

  if (typeof lastArg === 'object') {
    options = lastArg;
    fields.pop();
  }

  return (value: string | number, { req, location, path }) => {
    if (value !== undefined && !options.allowFalsy) return true;

    const pathKeychain = toNestedKeyArray(path);
    const requiredFields = fields.filter((field) => {
      const keychain = toNestedKeyArray(field).map((key, i) => {
        if (key === '*') return pathKeychain[i];
        return key;
      });

      const result = traverse(req[location], keychain);

      return result.some(({ value: fieldVal }) => {
        return fieldVal !== undefined;
      });
    });

    if (!requiredFields.length) return true;

    required({ req, path, location });

    const dependentFields = join(requiredFields, {
      delimiters: [', ', ' or '],
    }).toLowerCase();

    const verb = pluralize('is', requiredFields.length);

    return Promise.reject(
      `${sentenceCase(
        path,
      )} is required when ${dependentFields} ${verb} present.`,
    );
  };
};
