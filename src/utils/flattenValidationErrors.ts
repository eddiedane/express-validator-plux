import { FieldValidationError, ValidationError } from "express-validator";

type FlatErrors = { [key: string]: string[] };

export function flattenValidationErrors(errors: ValidationError[] = []) {
  return errors.reduce((fields: any, { path, msg }: any) => {
    if (path in fields) {
      fields[path].push(msg);
    } else {
      fields[path] = [msg];
    }

    return fields;
  }, {}) as FlatErrors;
}
