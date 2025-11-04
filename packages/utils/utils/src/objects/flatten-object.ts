/* eslint-disable @typescript-eslint/no-explicit-any */
type DotPrefix<T extends string, U extends string> =
  '' extends T ? U : `${T}.${U}`;

type NestedKeys<T, Prefix extends string = ''> = {
	[K in keyof T & string]:
	T[K] extends Record<string, any>
		? DotPrefix<Prefix, K> | NestedKeys<T[K], DotPrefix<Prefix, K>>
		: DotPrefix<Prefix, K>
}[keyof T & string];

export type FlattenObjectType<T> = Record<NestedKeys<T>, any>;

/**
 * Flattens an object using dot notation for nested fields.
 * Arrays are treated as leaf nodes and are not traversed.
 * Includes both nested objects and their individual properties as separate keys.
 *
 * Example:
 * flattenObject({ a: { b: 1, c: { d: 2 } } })
 *   -> {
 *        'a': { b: 1, c: { d: 2 } },
 *        'a.b': 1,
 *        'a.c': { d: 2 },
 *        'a.c.d': 2
 *      }
 */
export function flattenObject<T extends object>(input: T): FlattenObjectType<T> {
	const result = {} as any;

	if (input === null || input === undefined) return result;

	const isObject = (value: unknown): value is Record<string, unknown> =>
		typeof value === 'object' && value !== null && !Array.isArray(value);

	const stack: { path: string, value: any }[] = [{ path: '', value: input }];

	while (stack.length > 0) {
		const { path, value } = stack.pop() as { path: string, value: any };

		if (!isObject(value)) {
			if (path) {
				result[path] = value;
			}
			continue;
		}

		const entries = Object.entries(value);
		if (entries.length === 0) {
			if (path) result[path] = value;
			continue;
		}

		// Add the current object itself to the result
		if (path) {
			result[path] = value;
		}

		for (const [key, child] of entries) {
			const nextPath = path ? `${path}.${key}` : key;

			if (Array.isArray(child)) {
				result[nextPath] = child;
				continue;
			}

			if (isObject(child)) {
				stack.push({ path: nextPath, value: child });
				continue;
			}

			result[nextPath] = child;
		}
	}

	return result as FlattenObjectType<T>;
}
