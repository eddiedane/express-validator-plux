import { sentenceCase } from 'change-case';
import pluralize from 'pluralize';

import { ValidatorHandler } from '../../types';
import { join, required, toNestedKeyArray, traverse } from '../../utils';

export const forbiddenWithout = (
  fields: string[],
  options: { falsy?: boolean } = {},
): ValidatorHandler => {
  fields = typeof fields === 'string' ? [fields] : fields;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (value: any, { req, location, path }) => {
    if (value === undefined) return true;

    const forbiddenFields = fields.filter((field: string) => {
      const keychain = toNestedKeyArray(field);
      const result = traverse(req[location], keychain);

      return result.some(({ value }) => {
        if (options.falsy) {
          return !value;
        }

        return value === undefined;
      });
    });

    if (!forbiddenFields.length) return true;

    required({ req, path, location });

    return Promise.reject(
      `${sentenceCase(path)} is not allowed when ${join(
        forbiddenFields.map((field: string) => sentenceCase(field)),
        { delimiters: [', ', ' or '] },
      ).toLowerCase()} ${pluralize('is', forbiddenFields.length)} not present.`,
    );
  };
};
