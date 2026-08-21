/* * */

import { HttpException } from '@tmlmobilidade/consts';

/* * */

export interface SwrFetcherOptions {
	credentials?: RequestInit['credentials']
	url: string
	useProperApiResponse?: boolean
}

/**
 * Default SWR fetcher for GO APIs.
 * GO endpoints return an envelope with `data` and `error`; this fetcher unwraps
 * successful data while preserving HTTP failures as SWR errors.
 */
export async function swrFetcher<T>(urlOrOptions: string | SwrFetcherOptions): Promise<T> {
	const url = typeof urlOrOptions === 'string' ? urlOrOptions : urlOrOptions.url;
	const credentials = typeof urlOrOptions === 'string' ? 'include' : urlOrOptions.credentials ?? 'include';
	const useProperApiResponse = typeof urlOrOptions === 'string' || urlOrOptions.useProperApiResponse !== false;

	const response = await fetch(url, { credentials });
	const responseBody = await response.json() as { data?: T, error?: null | string };

	if (!response.ok || responseBody.error) {
		throw new HttpException(response.status, responseBody.error ?? `HTTP ${response.status} - ${response.statusText}`);
	}

	if (!useProperApiResponse) return responseBody as T;
	return responseBody.data as T;
}

/**
 * SWR fetcher for public endpoints that must not send cookies.
 */
export async function unauthenticatedSwrFetcher<T>(url: string): Promise<T> {
	return swrFetcher<T>({ credentials: 'omit', url });
}
