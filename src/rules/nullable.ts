/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidatorRuleFactory } from '../types';
import { hasErrors, required } from '../utils';

export const nullable: ValidatorRuleFactory<['without-errors']> = ({
  data: options,
}) => {
  return (value: any, { req, path, location }) => {
    required({
      on:
        options[0] === 'without-errors'
          ? () => hasErrors({ req: req as any, path })
          : false,
      req,
      path,
      location,
    });

    return true;
  };
};
