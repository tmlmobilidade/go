/* * */

import { HttpResponse } from '@/http/response.js';
import { HttpException } from '@tmlmobilidade/consts';

/* * */

export interface SwrFetcherOptions {

	/**
	 * Whether to include credentials in the fetch operation.
	 * @default 'include'
	 */
	credentials?: RequestInit['credentials']

	/**
	 * The URL to fetch from.
	 */
	url: string

	/**
	 * Whether to use the proper API response, where the response is an object with a data property.
	 * If false, the response is assumed to be the data directly.
	 * @default true
	 */
	useProperApiResponse?: boolean

}

/**
 * Fetches data from a URL using the SWR fetcher function.
 * @param urlOrOptions The URL to fetch from or the options object.
 * @returns Promise resolving to the fetched data
 * @example
 * ```ts
 * // Fetch data from a URL
 * const data = await swrFetcher('/api/users/123');
 *
 * // Fetch data from a URL with options
 * const data = await swrFetcher({ url: '/api/users/123', credentials: 'omit' });
 * ```
 */
export async function swrFetcher<T>(urlOrOptions: string | SwrFetcherOptions): Promise<T> {
	//

	//
	// Extract the URL either from the string directly
	// or from the options object

	const urlValue = typeof urlOrOptions === 'string' ? urlOrOptions : urlOrOptions.url;

	//
	// Extract the credentials option from the options object
	// or use the default value. By default, it uses 'include' credentials.

	const credentialsValue = typeof urlOrOptions === 'string' ? 'include' : urlOrOptions.credentials ?? 'include';

	//
	// Perform the fetch operation

	const res = await fetch(urlValue, { credentials: credentialsValue });
	const data = await res.json() as HttpResponse<T>;

	if (!res.ok) {
		throw new HttpException(res.status, data.error ?? 'An error occurred');
	}

	//
	// Return the data directly if the useProperApiResponse option is false
	// or directly accessing the data property of the HttpResponse object.

	if (typeof urlOrOptions === 'object' && urlOrOptions.useProperApiResponse === false) {
		return data as T;
	}

	return data.data as T;
};

/**
 * Fetches data from a URL using the SWR fetcher function.
 * @param urlOrOptions The URL to fetch from or the options object.
 * @returns Promise resolving to the fetched data
 * @deprecated Use `swrFetcher` with an options object instead.
 * ```ts
 * const data = await swrFetcher({ url: '/api/users/123', credentials: 'omit' });
 * ```
 */
export async function unauthenticatedSwrFetcher<T>(url: string): Promise<T> {
	return swrFetcher<T>({ credentials: 'omit', url: url });
}
