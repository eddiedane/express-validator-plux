/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from 'express';

export interface Obj {
  [key: string]: any;
}

export type DataLocation = 'body' | 'query';

export type ValidatorHandler = (
  value: any,
  options: { req: Request; path: string; location: 'body' | 'query' },
) => any | Promise<any>;

export type ValidatorFactionOptions<D = any> = { data: D; msg: string };

export type ValidatorRuleFactory<D = any> = {
  (options: ValidatorFactionOptions<D>): ValidatorHandler;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldRuleTuple = [string, (any | any[])?];

export type FieldRule = string | FieldRuleTuple | CallableFunction;

export interface Fields {
  [key: string]: boolean | string | FieldRule[];
}

export type $$Fields = {
  $$notEmpty?: boolean;
  $$lock?: boolean;
};

export type Schema = $$Fields & Fields;

export interface FieldsRuleList {
  [key: string]: FieldRule[];
}

export interface MessageConfig {
  key: string;
  alias?: string;
  info?: Obj;
  sanitizeNameAlias?: boolean;
}

export type LimitRuleValue =
  | string
  | number
  | ((req: Request, options: { path: string }) => string | number);
