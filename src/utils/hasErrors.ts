import { Request } from "express";

import { QV_CONTEXTS } from "../constants";
import { Obj } from "../types";
import { mergeNestedKeys } from "./keychain";

export function hasErrors({ req, path }: { req: Request & Obj; path: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return req[QV_CONTEXTS].some((ctx: any) => {
    return ctx.fields.some((field: string) => {
      const fieldPath = mergeNestedKeys(path, field).join('.');
      const matched = field.indexOf(fieldPath) === 0;

      return matched && ctx._errors.length;
    });
  });
}
