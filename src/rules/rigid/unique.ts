/* eslint-disable @typescript-eslint/no-explicit-any */

import { sentenceCase } from 'change-case';
import { Meta } from 'express-validator';
import { forIn, isNil, omitBy } from 'lodash';

import { Obj, ValidatorHandler } from '../../types';
import { getDbConnection } from '../../utils/getDbConnection';

type UniqueRuleOptions = {
  db?: string;
  table?: string;
  collection?: string;
  column?: string;
  key?: string;
  exclude?: string | ((meta: Meta) => Obj);
  message?: string | ((value: any, meta: Meta) => string);
  conditions?: (meta: Meta) => Obj;
  filter?: (query: any, req: Request) => void;
};

export const unique = (config: UniqueRuleOptions): ValidatorHandler => {
  const db = getDbConnection(config.db || 'default');

  return async (value: any = '', meta) => {
    return uniqueWithKnex(value, meta, config, db);
  };
};

async function uniqueWithKnex(
  value: any,
  meta: Meta,
  config: UniqueRuleOptions,
  db: any,
) {
  const {
    table,
    collection,
    column,
    exclude,
    message,
    conditions,
    filter = (q: any) => q,
  } = config;

  const { path, req } = meta;
  const col = column || path;
  const query = db
    .client(table || collection)
    .where(col, value)
    .where(col, '!=', '')
    .whereNotNull(col);

  if (conditions) {
    forIn(conditions(meta), (value, column) => {
      if (Array.isArray(value)) query.whereIn(column, value);
      else if (value === null) query.whereNull(column);
      else query.where(column, value);
    });
  }

  if (filter) {
    filter(query, req as Request);
  }

  if (exclude) {
    if (typeof exclude === 'string') {
      exclude &&
        req.params?.[exclude] &&
        query.where(exclude, '!=', req.params[exclude]);
    } else {
      const excludeObj = omitBy(exclude(meta), isNil);
      const { $on = true, ...excludeConditions } = excludeObj;

      if ($on) {
        for (const key in excludeConditions) {
          if (Object.prototype.hasOwnProperty.call(excludeConditions, key)) {
            const excludeValue = excludeConditions[key];
            query.where(key, '!=', excludeValue);
          }
        }
      }
    }
  }

  const result = await query.first();

  if (result) {
    return Promise.reject(
      message
        ? typeof message === 'function'
          ? message(value, meta)
          : message
        : `"${sentenceCase(path)}" (${value}) already exists.`,
    );
  }

  return true;
}
