import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type LocationItem, type LocationTreeNode } from '@tmlmobilidade/go-types-locations';

/* * */

/** Resolves submitted IDs to canonical locations. Unknown IDs reject the entire selection. */
export async function resolveAnnotationLocations(locations: LocationItem[]): Promise<LocationItem[] | null> {
	if (!locations.length) return [];

	const byId = new Map<number, LocationItem>();
	const collect = (nodes: LocationTreeNode[]) => {
		for (const node of nodes) {
			const osmId = Number(node.id);
			byId.set(osmId, { admin_level: node.admin_level, code: node.code, name: node.name, osm_id: osmId });
			collect(node.children);
		}
	};
	collect(await locationsProvider.findAdministrativeTree());

	const resolved: LocationItem[] = [];
	for (const osmId of new Set(locations.map(location => location.osm_id))) {
		const location = byId.get(osmId);
		if (!location) return null;
		resolved.push(location);
	}
	return resolved;
}
