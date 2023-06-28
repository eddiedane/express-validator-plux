import { ValidatorHandler } from '../types';

export function custom(fn: ValidatorHandler): ValidatorHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (value: any, opts) => {
    const result = await fn(value, opts);

    if (typeof result === 'string' || result === false) {
      return Promise.reject(result || 'Invalid input.');
    }

    return true;
  };
}
