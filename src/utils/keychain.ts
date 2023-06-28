/* eslint-disable @typescript-eslint/no-explicit-any */

import { Obj } from "../types";

export const keychainAssign = (obj: Obj, chain: string[], value: any) => {
  if (!chain || !chain.length) return;

  let _obj = obj;

  chain.forEach((key, i) => {
    if (i === chain.length - 1) _obj[key] = value;
    else _obj = _obj[key];
  });
};

/**
 * Parse path string to keychain array
 * @param {string} path
 * @param {string} delimiter
 * @returns {string[]}
 */
export const toNestedKeyArray = (path: string, delimiter: string = '.') => {
  return (
    path
      // resolve path string to dotted path only key[0].child => key.0.child
      .replace(/\]+$/, '') // remove last ], to prevent trailing delimiter
      .replace(/[\[\]]+/g, delimiter) // replace all [] with delimiter
      .replace(/\.{2,}/g, delimiter) // replace mulitple consecutive delimiters with one
      // split path into array of keychain
      .split(delimiter)
  );
};

export const mergeNestedKeys = (
  path1: string | string[],
  path2: string | string[],
) => {
  path1 = Array.isArray(path1) ? path1 : toNestedKeyArray(path1);
  path2 = Array.isArray(path2) ? path2 : toNestedKeyArray(path2);

  return path1.map((path, i) => {
    if (path === '*' || path2[i] === '*') return path2[i];
    return path;
  });
};

interface TraverseValue {
  value: any;
  keychain: string[];
}

interface TraverseOptions {
  obj: Obj;
  keychain: string[];
  values: TraverseValue[];
  i?: number;
  track?: any[];
}

export const traverse = (obj: Obj, keychain: string[]) => {
  const values: TraverseValue[] = [];

  const _traverse = ({
    obj,
    keychain,
    values,
    i = 0,
    track = [],
  }: TraverseOptions) => {
    const key = keychain[i];
    if (i >= keychain.length - 1) {
      values.push({
        value: obj && obj[key],
        keychain: [...track, key],
      });
    } else if (obj == null) {
      values.push({
        value: obj,
        keychain: track,
      });
    } else {
      const _i = i;
      const _obj = obj;
      const nextKey = keychain[++i];
      const firstKeyLoop = _i === 0 && key === '*';

      track.push(key);
      obj = obj[key];

      if (nextKey === '*' || firstKeyLoop) {
        i = firstKeyLoop ? _i : i;
        obj = firstKeyLoop ? _obj : obj;

        for (const x in obj) {
          const loopchain = [...keychain];
          loopchain[i] = x;

          _traverse({
            obj: obj[x],
            keychain: loopchain,
            values,
            i: i + 1,
            track: [...track, x],
          });
        }
      } else {
        _traverse({
          obj,
          keychain,
          values,
          i,
          track,
        });
      }
    }
  };

  _traverse({ obj, keychain, values });

  return values;
};

export function getNestedKeyArrays(obj: Obj) {
  const keychains: string[][] = [];

  capKeys(obj);

  return keychains;

  function capKeys(data: Obj, keys: string[] = []) {
    for (const key in data) {
      let keychain: string[] = [...keys];

      if (Object.prototype.hasOwnProperty.call(data, key)) {
        keychain.push(key);

        const value = data[key];

        if (value && typeof value === 'object')
          keychain = capKeys(value, keychain);
        else keychains.push(keychain);
      }
    }

    return keys;
  }
}
