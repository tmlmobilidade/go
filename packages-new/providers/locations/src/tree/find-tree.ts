/* * */

import { LOCATION_LEVELS, LOCATION_SLOTS, SUPPORTED_COUNTRIES, type SupportedCountryCode } from '@/levels.js';
import { bbox, booleanPointInPolygon, featureCollection, pointOnFeature } from '@tmlmobilidade/geo';
import { type LocationProperties, locationsDb, type LocationWithGeojson } from '@tmlmobilidade/go-interfaces-locationsdb';
import { type LocationTreeNode } from '@tmlmobilidade/go-types-locations';
import { type Feature, type MultiPolygon, type Point, type Polygon } from 'geojson';

/* * */

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

async function buildCountryTree(countryCode: SupportedCountryCode): Promise<LocationTreeNode[]> {
	const adminLevels = LOCATION_SLOTS.map(slot => LOCATION_LEVELS[countryCode][slot]);
	const rowsPerLevel = await Promise.all(adminLevels.map(async levels =>
		(await Promise.all(levels.map(level => locationsDb.findLocationsWithGeojsonByCountryAndAdminLevel(countryCode, level)))).flat(),
	));
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
 * Builds the administrative location tree for every supported country,
 * nesting each level inside the parent whose geometry contains it.
 * @returns Country root nodes, each with the `LOCATION_LEVELS` slots nested below.
 */
export function findTree(): Promise<LocationTreeNode[]> {
	// ponytail: process-lifetime cache. The first call pulls every geometry (~160 MB, a few seconds);
	// boundaries change rarely, so a restart is the refresh. Upgrade path: cachedb with a TTL.
	cache.tree ??= Promise.all(SUPPORTED_COUNTRIES.map(buildCountryTree)).then(trees => trees.flat()).catch((error) => {
		cache.tree = null;
		throw error;
	});
	return cache.tree;
}
