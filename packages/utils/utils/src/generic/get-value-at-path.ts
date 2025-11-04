/* * */

/**
 * Utility function that returns the value at a given path in an object.
 * @param obj The object to retrieve the value from.
 * @param path The path to the value in the object.
 * @returns The value at the given path or undefined if the path is invalid.
 */
export function getValueAtPath<T>(obj: T, path: keyof T | (NonNullable<unknown> & string)): unknown {
	if (!path) return undefined;
	const pathArray = (path as string).match(/([^[.\]])+/g) as string[];
	return pathArray.reduce((prevObj: unknown, key) => prevObj && (prevObj as Record<string, unknown>)[key], obj);
}
