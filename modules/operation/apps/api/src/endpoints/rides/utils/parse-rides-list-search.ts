/* * */

export interface ParsedRidesListSearch {
	driverIds: string[]
	routeShortNames: string[]
	text: null | string
	vehicleIds: string[]
}

/**
 * Parse rides list free-text search.
 *
 * Tags (stripped from the remaining text):
 * - `v:1234` / `v:1234,5678` → vehicle_ids
 * - `d:1234` / `d:1234,5678` → driver_ids
 * - `l:1001` / `l:1001,10B` → route_short_names
 *
 * Remaining text may contain `%%` wildcards for trip_id pattern matching.
 */
export function parseRidesListSearch(raw: string | undefined): ParsedRidesListSearch {
	const empty = { driverIds: [], routeShortNames: [], text: null, vehicleIds: [] };
	const search = raw?.trim();
	if (!search) return empty;

	const vehicleMatch = search.match(/v:([\d,]+)/);
	const driverMatch = search.match(/d:([\d,]+)/);
	const routeMatch = search.match(/l:([A-Za-z0-9,]+)/);

	const splitIds = (matched: string | undefined): string[] =>
		matched
			?.split(',')
			.map(id => id.trim())
			.filter(Boolean)
			?? [];

	const text = search
		.replace(/v:[\d,]+/g, '')
		.replace(/d:[\d,]+/g, '')
		.replace(/l:[A-Za-z0-9,]+/g, '')
		.trim() || null;

	return {
		driverIds: splitIds(driverMatch?.[1]),
		routeShortNames: splitIds(routeMatch?.[1]),
		text,
		vehicleIds: splitIds(vehicleMatch?.[1]),
	};
}
