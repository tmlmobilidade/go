/* * */

import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

/* * */

/** Populates stored paths, including older documents with numeric stop IDs. */
export async function populatePatternPath<T extends { stop_id: number | string }>(path: T[], loadStops: (ids: string[]) => Promise<Stop[]>): Promise<(T & { stop: null | Stop })[]> {
	const stopIds = [...new Set(path.map(pathItem => String(pathItem.stop_id)))];
	const stops = await loadStops(stopIds);
	const stopsMap = new Map(stops.map(stop => [String(stop._id), stop]));

	return path.map(pathItem => ({
		...pathItem,
		stop: stopsMap.get(String(pathItem.stop_id)) ?? null,
	}));
}
