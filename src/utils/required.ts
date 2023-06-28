import { Request } from 'express';

import { QV_REQUEST_STORE } from '../constants';
import { defaultFalsy } from './defaultFalsy';

type Options = {
  req: Request;
  path: string;
  location: string;
  on?: boolean | (() => boolean);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  falsy?: boolean | ((val: any) => boolean);
};

export function required({
  on: bool = true,
  falsy = defaultFalsy,
  req,
  path,
  location,
}: Options) {
  if (!location) throw new Error('required(): location not set');

  const request: any = req; // eslint-disable-line
  const field = request[QV_REQUEST_STORE].fields[path];
  request[QV_REQUEST_STORE].fields[path] = {
    ...field,
    required: bool,
    falsy,
    location,
  };
}
