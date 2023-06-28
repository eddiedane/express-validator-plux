// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defaultFalsy(value: any) {
  if (typeof value === 'string' && value.trim() === '') return true;
  else if (value == null) return true;

  return false;
}
