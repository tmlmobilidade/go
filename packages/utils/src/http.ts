import { HttpException } from '@tmlmobilidade/consts';

export class HttpResponse<T> {
	public readonly data: null | T;
	public readonly error: null | string;
	public readonly isOk?: () => boolean;
	public readonly statusCode: number;

	constructor(
		{ data, error, statusCode }: { data: null | T, error: null | string, statusCode: number },
	) {
		this.data = data;
		this.error = error;
		this.statusCode = statusCode;

		this.isOk = () => statusCode >= 200 && statusCode < 300;
	}
}

export type WithPagination<T> = T & {
	pagination: {
		limit: number
		page: number
		total: number
	}
};

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

/**
 * Sends a multipart form data request to a URL.
 * @param url - The URL to send the request to
 * @param formData - The FormData object containing the multipart form data
 * @returns Promise resolving to HttpResponse containing data, error and status
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('file', fileBlob);
 * formData.append('name', 'profile.jpg');
 * const response = await multipartFetch('/api/upload', formData);
 * ```
 */
export async function multipartFetch<T>(url: string, formData: FormData): Promise<HttpResponse<T>> {
	try {
		const response = await fetch(url, {
			body: formData,
			credentials: 'include',
			method: 'POST',
		});

		const data = await response.json() as HttpResponse<T>;

		if (!response.ok || data.error) {
			return new HttpResponse<T>({
				data: null,
				error: data.error,
				statusCode: response.status,
			});
		}

		return new HttpResponse<T>({
			data: data.data,
			error: null,
			statusCode: response.status,
		});
	} catch (error) {
		return new HttpResponse<T>({
			data: null,
			error: error instanceof Error ? error.message : 'Network error',
			statusCode: 500,
		});
	}
}

/**
 * Uploads a file to a URL using multipart form data.
 * @param url - The URL to send the request to
 * @param file - The file to upload
 * @returns Promise resolving to HttpResponse containing data, error and status
 * @example
 * ```ts
 * const response = await uploadFile('/api/upload', file);
 * ```
 */
export async function uploadFile<T>(url: string, file: File): Promise<HttpResponse<T>> {
	const formData = new FormData();
	formData.append('file', file, file.name);
	return await multipartFetch<T>(url, formData);
}

/**
 * Fetches data from a URL using the SWR fetcher function.
 * @param url - The URL to fetch from
 * @returns Promise resolving to the fetched data
 * @example
 * ```ts
 * const data = await swrFetcher('/api/users/123');
 * ```
 */
export const swrFetcher = async <T>(url: string): Promise<T> => {
	const res = await fetch(url, { credentials: 'include' });
	const data = await res.json() as HttpResponse<T>;

	if (!res.ok) {
		throw new HttpException(res.status, data.error ?? 'An error occurred');
	}

	return data.data as T;
};

/**
 * Fetches data from a URL using the SWR fetcher function.
 * @param url - The URL to fetch from
 * @returns Promise resolving to the fetched data
 * @example
 * ```ts
 * const data = await swrFetcher('/api/users/123');
 * ```
 */
export const unauthenticatedSwrFetcher = async <T>(url: string): Promise<T> => {
	const res = await fetch(url, { credentials: 'omit' });
	const data = await res.json() as HttpResponse<T>;

	if (!res.ok) {
		throw new HttpException(res.status, data.error ?? 'An error occurred');
	}

	return data.data as T;
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
