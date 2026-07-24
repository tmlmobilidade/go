/**
 * A type that represents either a single instance of type T or an array of type T.
 * @template T The type of the element(s).
 * @example
 * ```ts
 * function processItems<T>(items: OneOrMore<T>) {
 *   const arr = Array.isArray(items) ? items : [items];
 *   console.log(arr);
 * }
 *
 * processItems("apple");      // ["apple"]
 * processItems(["a", "b"]);   // ["a", "b"]
 * ```
 */
export type OneOrMore<T> = T | T[];
