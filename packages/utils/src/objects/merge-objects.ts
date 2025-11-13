/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Merges two objects or arrays.
 * @param target - The target object or array.
 * @param source - The source object or array.
 * @returns The merged object or array.
 *
 * @example
 * const target = { a: 1, b: 2 };
 * const source = { b: 3, c: 4 };
 * const merged = mergeObjects(target, source);
 * // merged will be:
 * // { a: 1, b: 3, c: 4 }
 *
 * @example
 * const target = [1, 2, 3];
 * const source = [4, 5, 6];
 * const merged = mergeObjects(target, source);
 * // merged will be:
 * // [1, 2, 3, 4, 5, 6]
 */
export function mergeObjects<T>(target: T, source: T): T {
	if (Array.isArray(target) && Array.isArray(source)) {
		// If arrays of primitives → unique values
		if (target.every(x => !isObject(x)) && source.every(x => !isObject(x))) {
			return Array.from(new Set([...source, ...target])) as T;
		}

		// If arrays of objects → deduplicate by deep equality
		const merged: any[] = [];
		const all = [...target, ...source];

		for (const obj of all) {
			if (!merged.some(existing => deepEqual(existing, obj))) {
				merged.push(mergeObjectsObject(existingDefaults(obj), obj));
			}
		}

		return merged as T;
	}

	if (isObject(target) && isObject(source)) {
		return mergeObjectsObject(target, source) as T;
	}

	// default: override
	return source;
}

function mergeObjectsObject(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
	const result: any = { ...target };
	for (const key of Object.keys(source)) {
		if (key in target) {
			result[key] = mergeObjects(target[key], source[key]);
		}
		else {
			result[key] = source[key];
		}
	}
	return result;
}

function isObject(item: unknown): item is Record<string, any> {
	return item !== null && typeof item === 'object' && !Array.isArray(item);
}

function deepEqual(a: any, b: any): boolean {
	if (a === b) return true;
	if (typeof a !== typeof b) return false;

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((val, i) => deepEqual(val, b[i]));
	}

	if (isObject(a) && isObject(b)) {
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);
		if (keysA.length !== keysB.length) return false;
		return keysA.every(k => deepEqual(a[k], b[k]));
	}

	return false;
}

// Helper: ensures merging empty object structure if needed
function existingDefaults(obj: any) {
	return isObject(obj) ? {} : obj;
}
