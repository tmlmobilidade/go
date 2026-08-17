/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';

/**
 * Fetches data from a URL with configurable HTTP method, body, headers, and options.
 * @param url - The URL to fetch from
 * @param method - The HTTP method to use (DELETE, GET, POST, PUT). Defaults to GET.
 * @param body - Optional request body data
 * @param headers - Optional request headers
 * @param options - Optional fetch options (excluding body, headers, method)
 * @returns Promise resolving to HttpResponse containing data, error and status
 * @example
 * ```ts
 * // GET request
 * const response = await fetchDataNew<User>('/api/users/123');
 *
 * // POST request with body
 * const response = await fetchDataNew<User>(
 *   '/api/users',
 *   'POST',
 *   { name: 'John', email: 'john@example.com' }
 * );
 * ```
 */
export async function fetchDataNew<T>(
	url: string,
	method: 'DELETE' | 'GET' | 'POST' | 'PUT' = 'GET',
	body?: unknown,
	headers: Record<string, string> = {},
	options: Omit<RequestInit, 'body' | 'headers' | 'method'> = {},
): Promise<ApiResponse<T>> {
	try {
		const response = await fetch(url, {
			body: body ? JSON.stringify(body) : undefined,
			credentials: 'include',
			headers: {
				...(method === 'GET' || method === 'DELETE' || 'Content-Type' in headers
					? {}
					: { 'Content-Type': 'application/json' }),
				...headers,
			},
			method,
			...options,
		});
		if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);
		const responseData = await response.json() as ApiResponse<T>;
		return responseData;
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error',
			status_code: '500',
			timestamp: Dates.now('utc').unix_timestamp,
		};
	}
}
