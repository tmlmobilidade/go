/* * */

import { type UnixTimestamp } from '@tmlmobilidade/types';

/**
 * Sorts an array of objects by a Unix timestamp key in ascending or descending order.
 * The key must be of type UnixTimestamp, which is a number representing the timestamp in milliseconds.
 * @param data The array of objects to be sorted.
 * @param key The key of the objects to sort by, which must be a UnixTimestamp.
 * @param direction The direction to sort the data, either 'asc' for ascending or 'desc' for descending. Defaults to 'asc'.
 * @returns A new array of objects sorted by the specified Unix timestamp key.
 */
export function sortByUnixTimestamp<T, K extends keyof T>(data: T[], key: K extends keyof T ? (T[K] extends UnixTimestamp ? K : never) : never, direction: 'asc' | 'desc' = 'asc'): T[] {
	//

	if (direction === 'desc') {
		return [...data].sort((a: T, b: T) => {
			return (b[key] as number) - (a[key] as number);
		});
	}

	//
	// If direction is 'asc'

	return [...data].sort((a: T, b: T) => {
		return (a[key] as number) - (b[key] as number);
	});

	//
}
