/* eslint-disable @typescript-eslint/no-explicit-any */

import { sentenceCase } from 'change-case';
import { Request } from 'express';
import { Meta } from 'express-validator';
import { forIn } from 'lodash';
import { isPlural, singular } from 'pluralize';

import { Obj, ValidatorHandler } from '../../types';
import { getDbConnection } from '../../utils/getDbConnection';

type ExistsRuleOptions = {
  db?: string;
  table?: string;
  collection?: string;
  column?: string;
  key?: string;
  pass?: boolean;
  exclude?: string | ((meta: Meta) => Obj);
  message?: string | ((value: any, meta: Meta) => string);
  conditions?: (meta: Meta) => Obj;
  filter?: (query: any, req: Request) => void;
};

export function exists(config: ExistsRuleOptions): ValidatorHandler {
  return async (value: any, meta) => {
    return existsWithKnex(value, meta, config);
  };
}

async function existsWithKnex(
  value: any,
  meta: Meta,
  config: ExistsRuleOptions,
) {
  const {
    db: connectionName = 'default',
    message,
    pass,
    conditions,

    table,
    collection,
    filter = (q: any) => q,
  } = config;

  let { column } = config;
  const db = getDbConnection(connectionName);
  const isArrayValue = Array.isArray(value);

  if (value == null || (isArrayValue && !value.length) || pass) return true;

  const { path, req } = meta;

  column = column === undefined ? path : column;

  const valueArray = isArrayValue ? value : [value];
  let query: any, result, failedValue;

  for (const item of valueArray) {
    query = db.client(table || collection);

    if (column) {
      query.where({ [column]: item });
    }

    if (filter) {
      filter(query, req as Request);
    }

    if (conditions) {
      forIn(conditions(meta), (value, column) => {
        if (Array.isArray(value)) query.whereIn(column, value);
        else if (value === null) query.whereNull(column);
        else query.where(column, value);
      });
    }

    result = await query.first();

    if (!result) {
      failedValue = item;
      break;
    }
  }

  if (!result) {
    const fieldName = isPlural(path) && isArrayValue ? singular(path) : path;

    return Promise.reject(
      message
        ? typeof message === 'function'
          ? message(failedValue, meta)
          : message
        : `${sentenceCase(fieldName)}${
            isArrayValue ? ` (${failedValue})` : ` (${value})`
          } does not exist.`,
    );
  }

  return true;
}
