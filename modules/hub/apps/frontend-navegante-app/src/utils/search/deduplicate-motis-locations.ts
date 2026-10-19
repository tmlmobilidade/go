import { type RoutePlannerLocation } from '@/types/route-planner/models';

/* * */

/** Remove repeated OSM entities without changing MOTIS's result order. */
export function deduplicateMotisLocations(locations: RoutePlannerLocation[]): RoutePlannerLocation[] {
	const seenIds = new Set<string>();

	return locations.filter((location) => {
		const id = location.id ?? location.label;
		if (seenIds.has(id)) return false;
		seenIds.add(id);
		return true;
	});
}
