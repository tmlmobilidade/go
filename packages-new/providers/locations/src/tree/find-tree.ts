/* * */

import { bbox, booleanPointInPolygon, featureCollection, pointOnFeature } from '@tmlmobilidade/geo';
import { type CountryCode, type LocationProperties, locationsDb, type LocationWithGeojson } from '@tmlmobilidade/go-interfaces-locationsdb';
import { type LocationTreeNode } from '@tmlmobilidade/go-types-locations';
import { type Feature, type MultiPolygon, type Point, type Polygon } from 'geojson';

/* * */

/**
 * OSM admin_levels shown per country, from the country down to the finest level.
 * PT: Country, District, Municipality, Parish. ES: Country, Autonomous Community, Province, Municipality.
 */
export const LOCATION_TREE_LEVELS: [CountryCode, number[]][] = [
	['PT', [2, 6, 7, 8]],
	['ES', [2, 4, 6, 8]],
];

type LocationPolygon = Feature<MultiPolygon | Polygon, LocationProperties>;

interface TreeEntry {
	node: LocationTreeNode
	polygons: LocationPolygon[]
}

const cache: { tree: null | Promise<LocationTreeNode[]> } = { tree: null };

/* * */

function toEntry(location: LocationWithGeojson): TreeEntry {
	const polygons = location.geojson.features.filter((feature): feature is LocationPolygon => feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon');
	for (const polygon of polygons) polygon.bbox = bbox(polygon);
	return {
		node: { admin_level: location.admin_level ?? '', children: [], code: location.code, id: location.id, name: location.name ?? location.id },
		polygons,
	};
}

function contains(parent: TreeEntry, point: Feature<Point>): boolean {
	return parent.polygons.some(polygon => booleanPointInPolygon(point, polygon));
}

async function buildCountryTree(countryCode: CountryCode, adminLevels: number[]): Promise<LocationTreeNode[]> {
	const rowsPerLevel = await Promise.all(adminLevels.map(adminLevel => locationsDb.findLocationsByCountryAndAdminLevel(countryCode, adminLevel)));
	const entriesPerLevel = rowsPerLevel.map(rows => rows.map(toEntry).sort((a, b) => a.node.name.localeCompare(b.node.name)));
	for (let level = 1; level < entriesPerLevel.length; level++) {
		for (const child of entriesPerLevel[level]) {
			const point = pointOnFeature(featureCollection(child.polygons));
			// Attach to the nearest ancestor level that contains the child (e.g. Ceuta has no province).
			let parent: TreeEntry | undefined;
			for (let ancestorLevel = level - 1; ancestorLevel >= 0 && !parent; ancestorLevel--) {
				parent = entriesPerLevel[ancestorLevel].find(candidate => contains(candidate, point));
			}
			parent?.node.children.push(child.node);
		}
	}
	return entriesPerLevel[0].map(entry => entry.node);
}

/**
 * Builds the administrative location tree for every configured country,
 * nesting each level inside the parent whose geometry contains it.
 * @returns Country root nodes, each with `LOCATION_TREE_LEVELS` nested below.
 */
export function findTree(): Promise<LocationTreeNode[]> {
	// ponytail: process-lifetime cache. The first call pulls every geometry (~160 MB, a few seconds);
	// boundaries change rarely, so a restart is the refresh. Upgrade path: cachedb with a TTL.
	cache.tree ??= Promise.all(
		LOCATION_TREE_LEVELS.map(([countryCode, adminLevels]) => buildCountryTree(countryCode, adminLevels)),
	).then(trees => trees.flat()).catch((error) => {
		cache.tree = null;
		throw error;
	});
	return cache.tree;
}
