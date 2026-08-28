/* * */

import { type ApiResponse } from '@tmlmobilidade/go-types-shared';

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
 * const response = await fetchApiMultipart('/api/upload', formData);
 * ```
 */
export async function fetchApiMultipart<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
	const response = await fetch(url, {
		body: formData,
		credentials: 'include',
		method: 'POST',
	});
	return await response.json();
}
