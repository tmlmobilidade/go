/* eslint-disable @typescript-eslint/no-explicit-any */
type Diff<T> = {
	[K in keyof T]?: T[K] extends (infer U)[]
		? (Diff<U> | { curr_value: U, prev_value: U })[]
		: T[K] extends object
			? Diff<T[K]> | { curr_value: T[K], prev_value: T[K] }
			: { curr_value: T[K], prev_value: T[K] };
};

/**
 * Compares two objects and returns the differences between them.
 *
 * @template T - The type of the objects being compared.
 * @param {T} prev - The previous state of the object.
 * @param {Partial<T>} curr - The current state of the object.
 * @returns {Diff<T>} - An object representing the differences between the previous and current states.
 *
 * This function iterates over the keys of the current object and compares each value with the corresponding value in the previous object.
 * If the values are arrays, it compares each element in the arrays and records any differences.
 * If the values are objects, it recursively compares the nested objects.
 * If the values are primitive types, it records the current and previous values if they differ.
 *
 * @example
 * const prev = { name: 'Alice', age: 30, hobbies: ['reading', 'hiking'] };
 * const curr = { name: 'Alice', age: 31, hobbies: ['reading', 'swimming'] };
 * const differences = compareObjects(prev, curr);
 * // differences will be:
 * // {
 * //   age: { curr_value: 31, prev_value: 30 },
 * //   hobbies: [{ curr_value: 'swimming', prev_value: 'hiking' }]
 * // }
 */
export function compareObjects<T extends object>(prev: T, curr: Partial<T>): Diff<T> {
	const diff: Partial<Diff<T>> = {};

	(Object.keys(curr) as (keyof T)[]).forEach((key) => {
		const prevVal = prev[key];
		const currVal = curr[key];

		if (prevVal === currVal) return;

		if (Array.isArray(prevVal) && Array.isArray(currVal)) {
			const arrayDiff: any[] = [];
			const maxLength = Math.max(prevVal.length, currVal.length);

			for (let i = 0; i < maxLength; i++) {
				const p = prevVal[i];
				const c = currVal[i];

				if (p === c) continue;

				if (typeof p === 'object' && typeof c === 'object' && p && c) {
					const nestedDiff = compareObjects(p, c as any);
					arrayDiff.push(nestedDiff);
				}
				else {
					arrayDiff.push({ curr_value: c, prev_value: p });
				}
			}

			if (arrayDiff.length > 0) {
				diff[key] = arrayDiff as Diff<T>[typeof key];
			}
		}
		else if (
			prevVal
			&& currVal
			&& typeof prevVal === 'object'
			&& typeof currVal === 'object'
		) {
			const nestedDiff = compareObjects(prevVal as any, currVal as any);
			if (Object.keys(nestedDiff).length > 0) {
				diff[key] = nestedDiff as Diff<T>[typeof key];
			}
		}
		else {
			diff[key] = { curr_value: currVal, prev_value: prevVal } as Diff<T>[typeof key];
		}
	});

	return diff as Diff<T>;
}
