/**
 * Makes keys in `TFields` required when `TCondition` is absent,
 * and optional when `TCondition` is present.
 * @template T The base object type.
 * @template TCondition The key that triggers optionality when present.
 * @template TFields The keys that become optional when `TCondition` is present.
 * @example
 * ```ts
 * type Lookup = OptionalIf<
 *   { from: string; localField?: string; foreignField?: string; pipeline?: any[] },
 *   'pipeline',
 *   'localField' | 'foreignField'
 * >;
 *
 * const a: Lookup = { from: "c", localField: "x", foreignField: "y" }; // ✅
 * const b: Lookup = { from: "c", pipeline: [] }; // ✅
 * const c: Lookup = { from: "c", pipeline: [], localField: "x" }; // ✅ (optional)
 * const d: Lookup = { from: "c" }; // ❌ (localField/foreignField required when no pipeline)
 * ```
 */
export type OptionalIf<T extends object, TCondition extends keyof T, TFields extends keyof T> =
  | (Omit<T, TCondition | TFields> & Partial<Pick<T, TFields>> & Required<Pick<T, TCondition>>)
  | (Omit<T, TFields> & Required<Pick<T, TFields>> & { [K in TCondition]?: never });
