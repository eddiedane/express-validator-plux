import { sentenceCase } from 'change-case';
import { isNumber as _isNumber } from 'lodash';

import { ValidatorFactionOptions, ValidatorHandler } from '../../types';

export function isNumber({ msg }: ValidatorFactionOptions): ValidatorHandler {
  return (value, { path }) => {
    const isNum = _isNumber(value);

    if (!isNum) {
      return Promise.reject(msg || `"${sentenceCase(path)}" must be a number.`);
    }

    return true;
  };
}
