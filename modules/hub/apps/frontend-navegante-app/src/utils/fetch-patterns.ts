'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';

/**
 * Fetch one or more patterns by their IDs in parallel.
 * @param patternIds The IDs of the patterns to fetch.
 * @returns An array of patterns.
 */
export async function fetchPatterns(patternIds: string[]): Promise<HubV1ApiPattern[][]> {
	const fetchPromises = patternIds.map((patternId) => {
		return fetch(API_ROUTES.hub.NETWORK_PATTERNS(patternId))
			.then(response => response.json())
			.then(data => data.data as HubV1ApiPattern[]);
	});
	return await Promise.all(fetchPromises);
}
