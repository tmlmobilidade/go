/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Generates all possible dot-separated paths for a given object type, including paths through arrays.
 * Turns `{ a: { b: string }, arr: { c: number }[] }` into `"a" | "a.b" | "arr" | "arr.0" | "arr.0.c"`
 * @template T The object type to generate paths for.
 * @template Prev A helper type to accumulate the current path prefix.
 */
export type DotPath<T, Prev extends string = ''> = {
	[K in keyof T & string]:
	T[K] extends (infer U)[]
		? | `${Prev}${K}.${number}`
		| `${Prev}${K}`
		| DotPath<U, `${Prev}${K}.${number}.`>
		: T[K] extends Record<string, any>
			? | `${Prev}${K}`
			| DotPath<T[K], `${Prev}${K}.`>
			: `${Prev}${K}`;
}[keyof T & string];

/**
 * Retrieves the type of the value located at a specified dot-separated path within an object type.
 * Supports paths through nested objects and arrays.
 * @template T The object type to retrieve the value from.
 * @template P The dot-separated path to the value.
 */
export type PathValue<T, P extends string> =
	P extends `${infer Key}.${infer Rest}`
		? Key extends keyof T
			? T[Key] extends (infer U)[]
				? Rest extends `${number}.${infer SubRest}`
					? PathValue<U, SubRest>
					: Rest extends `${number}`
						? U
						: never
				: PathValue<T[Key], Rest>
			: never
		: P extends keyof T
			? T[P]
			: T extends (infer U)[]
				? P extends `${number}`
					? U
					: never
				: never;

/**
 * Utility function that returns the value at a given path in an object.
 * @param obj The object to retrieve the value from.
 * @param path The path to the value in the object.
 * @returns The value at the given path or undefined if the path is invalid.
 */
export function getValueAtPath<T, P extends DotPath<T>>(obj: T, path: P): PathValue<T, P> {
	if (!path) return undefined as PathValue<T, P>;
	const pathArray = (path as string).match(/([^[.\]])+/g) as string[];
	return pathArray.reduce((prevObj: unknown, key) => prevObj && (prevObj as Record<string, unknown>)[key], obj) as PathValue<T, P>;
}

/**
 * Sets a value at a specified dot-separated path within an object.
 * If intermediate objects or arrays do not exist, they are created.
 * @param obj The object to set the value in.
 * @param path The dot-separated path where the value should be set.
 * @param value The value to set at the specified path.
 * @returns The updated object with the value set at the specified path.
 */
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function setValueAtPath<T extends object, P extends DotPath<T>>(obj: T, path: P, value: PathValue<T, P>): T {
	const keys = (path as string).split('.');

	for (const key of keys) {
		if (UNSAFE_KEYS.has(key)) {
			throw new Error(`Unsafe path segment: "${key}"`);
		}
	}

	let current: any = obj;

	keys.slice(0, -1).forEach((key) => {
		if (!(key in current)) {
			// If numeric key, initialize as array
			current[key] = /^\d+$/.test(key) ? [] : {};
		}
		current = current[key];
	});

	const lastKey = keys[keys.length - 1];
	current[lastKey] = value;

	return obj;
}
