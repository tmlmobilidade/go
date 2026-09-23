/* * */

import { Logger } from '@tmlmobilidade/logger';

/* * */

const DEFAULT_MOTIS_API_BASE_URL = 'https://motis.go.tmlmobilidade.pt';
const MOTIS_REQUEST_TIMEOUT_MS = 15_000;

/* * */

export type MotisQuery = Record<string, unknown>;

/* * */

interface MotisResponseSchema<T> {
	parse: (data: unknown) => T
}

export type MotisFetchResult<T> = { data: null, error: string, status_code: '502' | '504' } | { data: T, error: null };

/* * */

/**
 * Fetches one JSON resource from the configured MOTIS instance.
 * @param path The absolute MOTIS API path.
 * @param query Query parameters received by the Hub endpoint.
 * @param responseSchema Schema used to validate the MOTIS response.
 */
export async function fetchMotisJson<T>(path: string, query: MotisQuery, responseSchema: MotisResponseSchema<T>): Promise<MotisFetchResult<T>> {
	const baseUrl = (process.env.MOTIS_API_BASE_URL || DEFAULT_MOTIS_API_BASE_URL).replace(/\/$/, '');
	const upstreamUrl = new URL(`${baseUrl}${path}`);

	Object.entries(query).forEach(([key, value]) => appendQueryValue(upstreamUrl, key, value));

	const abortSignal = AbortSignal.timeout(MOTIS_REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(upstreamUrl, {
			headers: { accept: 'application/json' },
			signal: abortSignal,
		});

		if (!response.ok) {
			const upstreamMessage = (await response.text()).slice(0, 500);
			Logger.error({ message: `[hub/v1/motis] MOTIS returned HTTP ${response.status} for ${upstreamUrl.pathname}: ${upstreamMessage}` });
			return { data: null, error: `MOTIS returned HTTP ${response.status}`, status_code: '502' };
		}

		const responseData = await response.json();

		try {
			return { data: responseSchema.parse(responseData), error: null };
		} catch (error) {
			Logger.error({ error, message: `[hub/v1/motis] MOTIS returned an invalid response for ${upstreamUrl.pathname}` });
			return { data: null, error: 'MOTIS returned an invalid response', status_code: '502' };
		}
	} catch (error) {
		if (abortSignal.aborted) {
			Logger.error({ error, message: `[hub/v1/motis] MOTIS timed out after ${MOTIS_REQUEST_TIMEOUT_MS}ms at ${upstreamUrl.pathname}` });
			return { data: null, error: 'MOTIS service timed out', status_code: '504' };
		}

		Logger.error({ error, message: `[hub/v1/motis] Could not read MOTIS response at ${upstreamUrl.pathname}` });
		return { data: null, error: 'Could not read the MOTIS service response', status_code: '502' };
	}
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
