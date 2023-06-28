import { sentenceCase } from 'change-case';

type Options = {
  format?: CallableFunction;
  delimiters?: [string, string?];
};

export function join(
  list: (string | number)[],
  { format = sentenceCase, delimiters = [', ', ' & '] }: Options = {},
) {
  const strArr = list.map((item, index, array) =>
    format(item.toString(), index, array),
  );

  if (delimiters.length > 1) {
    const lft = strArr.slice(0, strArr.length - 1).join(delimiters[0]);

    return `${lft}${delimiters[1]}${strArr[strArr.length - 1]}`;
  } else {
    return strArr.join(delimiters[0]);
  }
}
