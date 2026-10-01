/* * */

import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';

/* * */

export interface ApiResponseOptions {

	/**
	 * The time the response was generated at in UTC milliseconds.
	 * @default undefined
	 */
	generated_at?: UnixMilliseconds

	/**
	 * The maximum age of the response in seconds.
	 * @default undefined
	 */
	max_age?: '1d' | '1h' | '1m' | '3s' | '5m' | '30m' | '30s' | null

}

/**
 * Receives a max_age value and returns the Cache-Control header.
 */
export function getCacheControlHeader(maxAge: ApiResponseOptions['max_age']) {
	// Return empty if no max_age is provided
	if (!maxAge) return '';
	// Return the Cache-Control header
	let maxAgeSeconds: number;
	if (typeof maxAge === 'number') maxAgeSeconds = maxAge;
	else if (maxAge === '3s') maxAgeSeconds = 3;
	else if (maxAge === '30s') maxAgeSeconds = 30;
	else if (maxAge === '1m') maxAgeSeconds = 60;
	else if (maxAge === '5m') maxAgeSeconds = 300;
	else if (maxAge === '30m') maxAgeSeconds = 1800;
	else if (maxAge === '1h') maxAgeSeconds = 3600;
	else if (maxAge === '1d') maxAgeSeconds = 86400;
	else throw new Error(`Invalid max_age: ${maxAge}`);
	return `public, max-age=${maxAgeSeconds}`;
}
