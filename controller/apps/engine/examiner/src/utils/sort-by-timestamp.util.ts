/* * */

import { type UnixTimestamp } from '@tmlmobilidade/types';

/**
 * Sorts an array of objects by date
 * @param data
 * @param key
 * @param direction
 * @returns
 */
export function sortByTimestamp<T, K extends keyof T>(data: T[], key: K extends keyof T ? (T[K] extends UnixTimestamp ? K : never) : never, direction: 'asc' | 'desc' = 'asc'): T[] {
	//

	if (direction === 'asc') {
		return [...data].sort((a: T, b: T) => {
			return (a[key] as number) - (b[key] as number);
		});
	}

	if (direction === 'desc') {
		return [...data].sort((a: T, b: T) => {
			return (b[key] as number) - (a[key] as number);
		});
	}

	//
}
