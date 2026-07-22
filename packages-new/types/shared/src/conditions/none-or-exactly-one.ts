/**
 * A type that represents either none or exactly one key-value pair in the object T.
 * @template T The type of the object.
 * @example
 * ```ts
 * type Filters = { name: string; age: number; email: string };
 * type FilterChoice = NoneOrExactlyOne<Filters>;
 *
 * const a: FilterChoice = {}; // ✅ none
 * const b: FilterChoice = { name: "Alice" }; // ✅ exactly one
 * const c: FilterChoice = { age: 30 }; // ✅ exactly one
 * const d: FilterChoice = { name: "Alice", age: 30 }; // ❌ error
 * ```
 */
export type NoneOrExactlyOne<T> = { [K in keyof T]: Partial<Record<Exclude<keyof T, K>, never>> & { [P in K]: T[P] } }[keyof T] | { [K in keyof T]?: never };
