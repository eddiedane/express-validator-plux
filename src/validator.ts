import { NextFunction, Request, Response } from 'express';
import {
  body,
  query,
  ValidationChain,
  ValidationError,
  validationResult,
} from 'express-validator';
import { get } from 'lodash';
import pluralize from 'pluralize';

import { QV_BEFORE_RESULT, QV_REQUEST_STORE } from './constants';
import {
  $$Fields,
  DataLocation,
  Fields,
  MessageConfig,
  Obj,
  Schema,
} from './types';
import {
  combineMessages,
  customRules,
  fieldMessages,
  getNestedKeyArrays,
  getRuleArgs,
  getRuleName,
  resolveFields,
  suppressErrors,
  toNestedKeyArray,
} from './utils';
import { resolveRule } from './utils/resolveRule';

let customRulesLibrary: Obj = customRules(require('./rules'));

export function addCustomRules(
  rules: Obj | CallableFunction,
  wrap: boolean = false,
) {
  if (typeof rules === 'function' && rules.name) {
    rules = { [rules.name]: rules };
  }

  customRulesLibrary = Object.assign(
    customRulesLibrary,
    customRules(rules, wrap),
  );
}

export function validator(
  validationFields: Schema,
  errorMessages: Obj = {},
  type: DataLocation = 'body',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  const { $$fields, fields } = seperate$$Fields(validationFields);

  return [
    initChain,
    $$validator({ $$fields, fields, location: type }),
    ...build(fields, errorMessages, type),
    runBeforeResult,
    validationResponse,
  ];
}

export async function imperativeValidator(
  req: Request,
  res: Response,
  next: NextFunction,
  fieldRules: Schema,
  errorMessages?: Obj,
  type?: DataLocation,
) {
  const { $$fields, fields } = seperate$$Fields(fieldRules);

  const validationChain = build(fields, errorMessages, type);

  initChain(req, res);
  if (!$$validator({ $$fields, fields, location: type })(req, res))
    return next();

  await Promise.all(
    validationChain.map((validation) => {
      return validation.run(req);
    }),
  );

  runBeforeResult(req, res);
  validationResponse(req, res, next);
}

export async function checkBody(
  req: Request,
  res: Response,
  next: NextFunction,
  fieldRules: Schema,
  messages?: Obj,
) {
  return imperativeValidator(req, res, next, fieldRules, messages, 'body');
}

export async function checkQuery(
  req: Request,
  res: Response,
  next: NextFunction,
  fieldRules: Schema,
  messages?: Obj,
) {
  return imperativeValidator(req, res, next, fieldRules, messages, 'query');
}

function initChain(req: Request, res: Response, next?: NextFunction) {
  const request: any = req; // eslint-disable-line
  request[QV_BEFORE_RESULT] = request[QV_BEFORE_RESULT] || [];
  request[QV_REQUEST_STORE] = { fields: {} };

  if (next) next();
}

function $$validator({
  $$fields,
  fields,
  location = 'body',
}: {
  $$fields: $$Fields;
  fields: Fields;
  location?: 'body' | 'query';
}) {
  return (req: Request, res: Response, next?: NextFunction) => {
    const data = req[location];
    const errors: ValidationError[] = [];

    if ($$fields.$$notEmpty) {
      const isNotEmpty =
        (!!data && typeof data === 'object' && !!Object.keys(data).length) ||
        (typeof data !== 'object' && !!data);

      if (!isNotEmpty) {
        errors.push({
          msg: 'Empty request not allowed',
          type: 'field',
          path: '.',
          location,
          value: data,
        });
      }
    }

    if ($$fields.$$lock) {
      const keys = Object.keys(fields);
      const dataKeychains = getNestedKeyArrays(data);
      const unknownKeys: string[] = [];

      dataKeychains.forEach((dataKeychain) => {
        const knownKey = keys.some((keychainStr) => {
          const keychain = toNestedKeyArray(keychainStr);

          return dataKeychain.every((dataPath, i) => {
            const keychainPath = keychain[i];

            return dataPath === keychainPath || keychainPath === '*';
          });
        });

        if (!knownKey) {
          unknownKeys.push(dataKeychain.join('.'));
        }
      });

      if (unknownKeys.length) {
        errors.push({
          msg: `${pluralize('Field', unknownKeys.length)} not allowed.`,
          type: 'unknown_fields',
          fields: unknownKeys.map((path) => {
            return {
              type: 'field',
              location,
              path,
              message: `Unknown field (${path}) is not allowed`,
              value: get(data, path),
            };
          }),
        });
      }
    }

    if (errors.length) {
      errorRes(res, { message: 'Invalid request schema', errors });
      return false;
    }

    next && next();

    return true;
  };
}

function validationResponse(req: Request, res: Response, next: NextFunction) {
  const result = validationResult(req);

  if (result.isEmpty()) next();
  else errorRes(res, { errors: result.array() });
}

function errorRes(
  res: Response,
  {
    name = 'ValidationError',
    message = 'Invalid request parameters',
    status = 400,
    errors = [],
  }: {
    name?: string;
    message?: string;
    status?: number;
    errors?: any[]; // eslint-disable-line
  },
) {
  res
    .status(status)
    .json({
      name,
      message,
      status,
      errors,
    })
    .end();
}

function checkStoreFields(req: Request) {
  const request: any = req; // eslint-disable-line
  const { fields } = request[QV_REQUEST_STORE];

  for (const path in fields) {
    const { required: bool, location } = fields[path];
    const required = typeof bool === 'function' ? bool() : bool;

    if (required || required == null) continue;

    const value = get(request[location], path);

    if (value == null) suppressErrors({ req, path });
  }
}

function runBeforeResult(req: Request, res: Response, next?: NextFunction) {
  checkStoreFields(req);
  const request: any = req; // eslint-disable-line
  request[QV_BEFORE_RESULT].forEach((fn: () => void) => fn());
  if (next) next();
}

function seperate$$Fields(validationFields: Schema) {
  const { $$lock, $$notEmpty, ...rest } = validationFields;

  return {
    $$fields: { $$lock, $$notEmpty },
    fields: rest,
  };
}

function build(
  validationFields: Fields,
  errorMessages: Obj = {},
  type: DataLocation = 'body',
) {
  const fields = resolveFields(validationFields);
  const validationChain: ValidationChain[] = [];
  const fieldKeys = Object.keys(fields);
  const msgConfigs: MessageConfig[] = fieldKeys.map((fieldKey) => {
    const info: Obj = {};
    const rules = fields[fieldKey];
    rules.forEach((rule) => {
      if (typeof rule !== 'object') return;
      const ruleName = getRuleName(rule);
      const ruleArgs = getRuleArgs(rule);

      if (ruleName) {
        info[ruleName] = ruleArgs.length === 1 ? ruleArgs[0] : ruleArgs;
      }
    });

    return { key: fieldKey, info };
  });

  const messages = combineMessages(fieldMessages(msgConfigs), errorMessages);

  const expressValidator = { body, query };
  const rulesWithoutMessage = ['optional', 'bail'];

  for (const fieldName in fields) {
    const rules = fields[fieldName];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fieldValidation = expressValidator[type](fieldName) as unknown as any;

    rules.forEach((rule) => {
      rule = resolveRule(rule);
      const ruleName = getRuleName(rule);

      if (ruleName) {
        if (ruleName in customRulesLibrary) {
          const ruleArgs = getRuleArgs(rule);
          const ruleFactory = customRulesLibrary[ruleName];

          try {
            fieldValidation = fieldValidation.custom(
              ruleFactory({
                data: ruleArgs,
                msg: messages?.[fieldName]?.[ruleName],
              }),
            );
          } catch (err) {
            const ruleInstance = new ruleFactory();

            if (ruleInstance.set) {
              fieldValidation = fieldValidation.custom(
                ruleInstance.set({
                  data: ruleArgs,
                  msg: messages?.[fieldName]?.[ruleName],
                }),
              );
            }
          }
        } else if (ruleName in fieldValidation) {
          const ruleArgs = getRuleArgs(rule, true);

          fieldValidation = fieldValidation[ruleName](...ruleArgs);
          if (!rulesWithoutMessage.includes(ruleName)) {
            fieldValidation = fieldValidation.withMessage(
              messages[fieldName][ruleName],
            );
          }
        } else {
          throw new Error(
            `rule (${fieldName}:${ruleName}) was not found, check for typos.`,
          );
        }
      } else {
        fieldValidation = fieldValidation.custom(rule);
      }
    });

    validationChain.push(fieldValidation);
  }

  return validationChain;
}
