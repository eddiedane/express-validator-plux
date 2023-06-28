/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from 'express';

import { QV_BEFORE_RESULT, QV_CONTEXTS } from '../constants';
import { Obj } from '../types';
import { mergeNestedKeys } from './keychain';

export function suppressErrors({
  req,
  path,
  on = true,
}: {
  req: Request & Obj;
  path: string;
  on?: boolean;
}) {
  if (!on) return;

  req[QV_BEFORE_RESULT].push(() => {
    req[QV_CONTEXTS].forEach((ctx: any) => {
      ctx.fields.forEach((field: string) => {
        const fieldPath = mergeNestedKeys(path, field).join('.');
        const matched = field.indexOf(fieldPath) === 0;
        const iterator = fieldPath.indexOf('*') !== -1;

        if (matched) {
          if (iterator) {
            ctx._errors = ctx._errors.filter(({ param }: { param: string }) => {
              return param !== path;
            });
          } else {
            ctx._errors = [];
          }
        }
      });
    });
  });
}
