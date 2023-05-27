export function isObject(value: unknown) {
  return typeof value === 'object' && value !== null;
}

export function isFunction(value: unknown): Boolean {
  return typeof value === 'function';
}