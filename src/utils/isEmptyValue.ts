// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEmptyValue(value: any, falsy?: boolean | CallableFunction) {
  return typeof falsy === 'function'
    ? falsy(value)
    : falsy
    ? !value
    : value === undefined;
}
