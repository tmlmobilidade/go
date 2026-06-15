/* * */

import { HttpResponse } from '@/http/response.js';

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
 * const response = await fetchData<User>('/api/users/123');
 *
 * // POST request with body
 * const response = await fetchData<User>(
 *   '/api/users',
 *   'POST',
 *   { name: 'John', email: 'john@example.com' }
 * );
 * ```
 */
export async function fetchData<T>(
	url: string,
	method: 'DELETE' | 'GET' | 'POST' | 'PUT' = 'GET',
	body?: unknown,
	headers: Record<string, string> = {},
	options: Omit<RequestInit, 'body' | 'headers' | 'method'> = {},
	retries = 3, // number of retries (default 3)
): Promise<HttpResponse<T>> {
	let attempt = 0;
	let lastError: unknown;

	while (attempt <= retries) {
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

			const data = (await response.json()) as HttpResponse<T>;

			if (!response.ok || data.error) {
				// Don't retry for 4xx (client) errors
				if (response.status >= 400 && response.status < 500) {
					return new HttpResponse<T>({
						data: null,
						error: data.error,
						statusCode: response.status,
					});
				}
				throw new Error(`HTTP ${response.status} - ${data.error ?? 'Unknown error'}`);
			}

			return new HttpResponse<T>({
				data: data.data,
				error: null,
				statusCode: response.status,
			});
		} catch (error) {
			lastError = error;
			attempt++;

			// Stop retrying if we've reached the limit
			if (attempt > retries) break;

			// Wait before retrying (exponential backoff: 0.5s, 1s, 2s, etc.)
			const delay = 500 * Math.pow(2, attempt - 1);
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}

	return new HttpResponse<T>({
		data: null,
		error:
			lastError instanceof Error
				? `${lastError.message} - ${lastError.cause ?? ''}`
				: 'Network error',
		statusCode: 500,
	});
}
