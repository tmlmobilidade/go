'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { fetchApiData } from '@tmlmobilidade/ui';

/**
 * Fetch one or more patterns by their IDs in parallel.
 * @param patternIds The IDs of the patterns to fetch.
 * @returns An array of patterns.
 */
export async function fetchPatterns(patternIds: string[]): Promise<HubV1ApiPattern[][]> {
	const fetchPromises = patternIds.map(async (patternId) => {
		const response = await fetchApiData<HubV1ApiPattern[]>({ credentials: 'omit', url: API_ROUTES.hub.NETWORK_PATTERNS(patternId) });
		if (response.error || !Array.isArray(response.data)) return null;
		return response.data.filter((pattern): pattern is HubV1ApiPattern => pattern !== null && typeof pattern === 'object');
	});
	const patterns = await Promise.all(fetchPromises);
	const availablePatterns = patterns.filter((group): group is HubV1ApiPattern[] => group !== null);
	if (patternIds.length > 0 && availablePatterns.length === 0) throw new Error('Unable to load patterns');
	return availablePatterns;
}
