/* * */

import { HttpException } from '@tmlmobilidade/consts';

export type WithPagination<T> = T & {
	pagination: {
		limit: number
		page: number
		total: number
	}
};

/**
 * Fetches data from a URL using the SWR fetcher function without authentication.
 * @param url - The URL to fetch from
 * @returns Promise resolving to the fetched data
 * @example
 * ```ts
 * const data = await standardSwrFetcher('/api/users/123');
 * ```
 */
export const standardSwrFetcher = async <T>(url: string): Promise<T> => {
	const res = await fetch(url, { credentials: 'omit' });
	if (!res.ok) {
		throw new HttpException(res.status, res.statusText);
	}

	return res.json() as T;
};
