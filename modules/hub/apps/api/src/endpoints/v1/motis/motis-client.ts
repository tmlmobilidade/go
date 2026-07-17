/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Logger } from '@tmlmobilidade/logger';

import { type MotisQuery } from './motis.types.js';

/* * */

const DEFAULT_MOTIS_API_BASE_URL = 'http://localhost:8080';

/* * */

/**
 * Fetches one JSON resource from the configured MOTIS instance.
 * @param path The absolute MOTIS API path.
 * @param query Query parameters received by the Hub endpoint.
 */
export async function fetchMotisJson<T>(path: string, query: MotisQuery): Promise<T> {
	const baseUrl = (process.env.MOTIS_API_BASE_URL || DEFAULT_MOTIS_API_BASE_URL).replace(/\/$/, '');
	const upstreamUrl = new URL(`${baseUrl}${path}`);

	Object.entries(query).forEach(([key, value]) => appendQueryValue(upstreamUrl, key, value));

	let response: Response;

	try {
		response = await fetch(upstreamUrl, {
			headers: { accept: 'application/json' },
		});
	} catch (error) {
		Logger.error({ error, message: `[hub/v1/motis] Could not reach MOTIS at ${upstreamUrl.pathname}` });
		throw new HttpException(HTTP_STATUS.BAD_GATEWAY, 'Could not reach the MOTIS service');
	}

	if (!response.ok) {
		const upstreamMessage = (await response.text()).slice(0, 500);
		Logger.error({ message: `[hub/v1/motis] MOTIS returned HTTP ${response.status} for ${upstreamUrl.pathname}: ${upstreamMessage}` });
		throw new HttpException(HTTP_STATUS.BAD_GATEWAY, `MOTIS returned HTTP ${response.status}`);
	}

	return await response.json() as T;
}

/* * */

function appendQueryValue(url: URL, key: string, value: unknown) {
	if (Array.isArray(value)) {
		value.forEach(item => appendQueryValue(url, key, item));
		return;
	}

	if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
		url.searchParams.append(key, String(value));
	}
}
