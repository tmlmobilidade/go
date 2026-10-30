/* * */

import { type ApiResponse, ApiResponseErrorSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

interface FetchApiDataParams<K = unknown> {

	/**
	 * The body of the request.
	 * @default undefined
	 */
	body?: K

	/**
	 * The credentials mode of the request.
	 * @default 'include'
	 */
	credentials?: RequestCredentials

	/**
	 * The headers of the request.
	 * @default { 'Content-Type': 'application/json' }
	 */
	headers?: Record<string, string>

	/**
	 * The method of the request.
	 * @default 'GET'
	 */
	method?: 'DELETE' | 'GET' | 'POST' | 'PUT'

	/**
	 * The options of the request.
	 * @default undefined
	 */
	options?: Omit<RequestInit, 'body' | 'headers' | 'method'>

	/**
	 * The URL of the request.
	 * @example 'https://api.example.com/users/123'
	 * @required
	 */
	url: string
}

/**
 * Simple wrapper around the native fetch() to handle GO's API responses.
 * It returns an `ApiResponse<T>` object containing the data, error, status code and timestamp.
 * @param params The parameters for the fetch request
 * @returns Promise resolving to `ApiResponse<T>` object containing data, error, status code and timestamp
 * @example
 * ```ts
 * // GET request
 * const response = await fetchApiData<User>({ url: '/api/users/123' });
 * console.log(response); // The ApiResponse<User> object
 * console.log(response.data); // The User data
 * console.log(response.timestamp); // The server timestamp
 *
 * // POST request with body
 * const response = await fetchApiData<User>({
 *   url: '/api/users',
 *   method: 'POST',
 *   body: userData
 * });
 * console.log(response); // The ApiResponse<User> object
 * console.log(response.data); // The User data
 * console.log(response.timestamp); // The server timestamp
 * ```
 */
export async function fetchApiData<T, K = unknown>(params: FetchApiDataParams<K>): Promise<ApiResponse<T>> {
	//

	//
	// Set the default options and let them be replaced
	// by the user's options if provided

	const validatedParams: FetchApiDataParams<K> = {
		credentials: 'include',
		headers: {},
		method: 'GET',
		options: {},
		...params,
	};

	const validatedHeaders: HeadersInit = {
		...(validatedParams.body ? { 'Content-Type': 'application/json' } : {}),
		...validatedParams.headers,
	};

	//
	// Attempt to fetch the data

	try {
		const response = await fetch(validatedParams.url, {
			body: validatedParams.body ? JSON.stringify(validatedParams.body) : undefined,
			credentials: validatedParams.credentials,
			headers: validatedHeaders,
			method: validatedParams.method,
			...validatedParams.options,
		});
		const responseData = await response.json().catch(() => null);
		if (!response.ok) {
			const parsedError = ApiResponseErrorSchema.safeParse({
				data: null,
				error: typeof responseData?.error === 'string' ? responseData.error : `HTTP ${response.status} - ${response.statusText}`,
				status_code: String(response.status),
				timestamp: Dates.now('utc').unix_milliseconds,
			});
			if (parsedError.success) return parsedError.data;
			throw new Error(`HTTP ${response.status} - ${response.statusText}`);
		}
		if (!responseData) throw new Error('Invalid API response');
		// Return the response data
		return responseData;
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error',
			status_code: '500',
			timestamp: Dates.now('utc').unix_milliseconds,
		};
	}
}
