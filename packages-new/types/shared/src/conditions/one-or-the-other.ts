/**
 * A type that represents either A or B, but not both.
 * @template A The first type.
 * @template B The second type.
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
