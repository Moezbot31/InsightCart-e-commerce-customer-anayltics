/**
 * Removes fields with undefined values from an object.
 * Firestore does not support undefined values.
 */
export function removeUndefinedFields<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as T;
}

/**
 * Recursively removes undefined fields from an object and its nested objects/arrays.
 */
export function deepRemoveUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => deepRemoveUndefined(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, deepRemoveUndefined(v)])
    );
  }
  return obj;
}
