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

  const len = strArr.length;

  if (!len) return '';
  else if (len === 1) return strArr[0];

  if (delimiters.length > 1) {
    const lft = strArr
      .slice(0, len - 1)
      .join(delimiters[0])
      .trim();

    return `${lft}${delimiters[1]}${strArr[len - 1]}`.trim();
  } else {
    return strArr.join(delimiters[0]).trim();
  }
}
