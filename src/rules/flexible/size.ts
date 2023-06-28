/* eslint-disable @typescript-eslint/no-explicit-any */

import pluralize from 'pluralize';
import { sentenceCase } from 'sentence-case';

import { ValidatorFactionOptions, ValidatorHandler } from '../../types';

export function size({
  data: [len],
}: ValidatorFactionOptions<[number]>): ValidatorHandler {
  len = Number(len);
  return (val: any, meta) => {
    if (!['string', 'number', 'array'].includes(typeof val)) return true;

    const _len = len;
    const _valLen: number = typeof val === 'number' ? val : val.length;

    if (_valLen !== _len) {
      const msg =
        typeof val === 'number'
          ? `${sentenceCase(meta.path)} must not be equal to ${_len}`
          : typeof val === 'string'
          ? `${sentenceCase(
              meta.path,
            )} must be contain exactly ${_len} ${pluralize('character', _len)}`
          : `${sentenceCase(
              meta.path,
            )} must contain exactly ${_len} ${pluralize('item', _len)}`;

      return Promise.reject(msg);
    }

    return true;
  };
}
