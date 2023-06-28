import { sentenceCase } from 'change-case';

import { MessageConfig, Obj } from '../types';

const getInfo = (info: Obj, ruleName: string, prop: string) => {
  const value = info && info[ruleName];
  return prop != null && value ? value[prop] : value;
};

const isLengthMsg = (field: string, info: Obj) => {
  const min = getInfo(info, 'isLength', 'min');
  const max = getInfo(info, 'isLength', 'max');

  const isRange = min != null && max != null;

  let msg = `${field} length is not valid.`;

  if (isRange) {
    msg = `${field} must be between ${min} - ${max} characters long.`;
  } else if (min != null) {
    msg = `${field} must be atleast ${min} characters long.`;
  } else if (max != null) {
    msg = `${field} must not be more than ${max} characters long.`;
  }

  return msg;
};

const isIntMsg = (field: string, info: Obj) => {
  const min = getInfo(info, 'isInt', 'min');
  const max = getInfo(info, 'isInt', 'max');

  const isRange = min != null && max != null;

  let msg = `${field} must be an integer.`;

  if (isRange) {
    msg = `${field} must be an integer between ${min} - ${max}.`;
  } else if (min != null) {
    msg = `${field} must be an integer not less than ${min}.`;
  } else if (max != null) {
    msg = `${field} must be an integer not greater than ${max}.`;
  }

  return msg;
};

export const fieldMessages = (fields: MessageConfig[] = []) => {
  return fields.reduce((fieldMsgs, fieldOptions) => {
    const { alias, key, info = {}, sanitizeNameAlias = true } = fieldOptions;
    let field = alias || key;

    if (field === key && sanitizeNameAlias) {
      field = field
        .replace(
          /([a-z])([A-Z])/g,
          (fullMatch, lower, upper) => `${lower} ${upper}`,
        )
        .replace(/(\W|[_])+/, ' ');

      field = sentenceCase(field);
    }

    return {
      ...fieldMsgs,
      [key || alias || 'undefined']: {
        isString: `${field} must be a string.`,
        isAlpha: `${field} can only contain alphabets.`,
        isEmail: `${field} must be a valid e-mail address.`,
        isArray: `${field} must be an array.`,
        isDate: `${field} must be a valid date.`,
        isMobilePhone: `${field} is not a valid mobile phone number.`,
        isLength: isLengthMsg(field, info),
        isInt: isIntMsg(field, info),
        isObject: `${field} must be a json object.`,
        isNumeric: `${field} must be numeric.`,
        isDecimal: `${field} must be a valid decimal value${
          info?.isDecimal?.decimal_digits
            ? `, with ${info?.isDecimal?.decimal_digits} decimal digits`
            : ''
        }.`,
        isBoolean: `${field} must be a boolean value`,
        isBefore: `${field} must be before ${info && info.isBefore}.`,
        isAfter: `${field} must be after ${info && info.isAfter}.`,
        isURL: `${field} is not an acceptable URL format.`,
        isStrongPassword: `${field} is too weak.`,
        exists: `${field} is required.`,
        notEmpty: `${field} is required and can not be empty.`,
        matches: `${field} format is not valid.`,
      },
    };
  }, {});
};
