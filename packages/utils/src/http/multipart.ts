/* * */

import { HttpResponse } from '@/http/response.js';

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
