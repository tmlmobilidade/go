'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubPattern } from '@tmlmobilidade/go-types-hub';
import { fetchApiData } from '@tmlmobilidade/ui';

/**
 * Fetch one or more patterns by their IDs in parallel.
 * @param patternIds The IDs of the patterns to fetch.
 * @returns An array of patterns.
 */
export async function fetchPatterns(patternIds: string[]): Promise<HubPattern[][]> {
	const fetchPromises = patternIds.map(async (patternId) => {
		const response = await fetchApiData<HubPattern[]>({
			options: { credentials: 'omit' },
			url: API_ROUTES.hub.NETWORK_PATTERNS(patternId),
		});
		return response.data ?? [];
	});
	return await Promise.all(fetchPromises);
}
