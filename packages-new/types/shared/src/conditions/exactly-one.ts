/**
 * A type that represents exactly one key-value pair in the object T.
 * @template T The type of the object.
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
