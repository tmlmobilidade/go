/**
 * A type that represents either a single instance of type T or an array of type T.
 *
 * @template T - The type of the element(s).
 *
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

/**
 * A type that represents either A or B, but not both.
 *
 * @template A - The first type.
 * @template B - The second type.
 *
 * @example
 * ```ts
 * type Credentials = OneOrTheOther<{ email: string }, { username: string }>;
 *
 * const a: Credentials = { email: "a@b.com" };    // ✅
 * const b: Credentials = { username: "user1" };   // ✅
 * const c: Credentials = { email: "a@b.com", username: "user1" }; // ❌
 * ```
 */
export type OneOrTheOther<A, B> =
	| (A & { [K in keyof B]?: never })
	| (B & { [K in keyof A]?: never });

/**
 * A type that represents exactly one key-value pair in the object T.
 *
 * @template T - The type of the object.
 *
 * @example
 * ```ts
type Action = ExactlyOne<{
  create: { name: string };
  update: { id: string; name?: string };
  delete: { id: string };
}>;

const x: Action = { create: { name: "New" } }; // ✅
const y: Action = { update: { id: "123" } };   // ✅
const z: Action = { create: { name: "X" }, delete: { id: "1" } }; // ❌
 * ```
 */
export type ExactlyOne<T> = {
	[K in keyof T]:
		Partial<Record<Exclude<keyof T, K>, never>> & { [P in K]: T[P] }
}[keyof T];

/**
 * A type that represents either none or exactly one key-value pair in the object T.
 *
 * @template T - The type of the object.
 *
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
