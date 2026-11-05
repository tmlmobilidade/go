/* * */

import { booleanPointOnLine, isPointInPolygon } from '@tmlmobilidade/geo';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { type Path, type Zone } from '@tmlmobilidade/go-types-offer';

/* * */

type StopZone = Pick<Zone, '_id' | 'agency_ids' | 'geojson'>;

/* * */

/**
 * Finds every zone containing a stop, restricted to the supplied agencies.
 * Pattern callers must supply the parent Line's agency.
 * Supports Polygon and MultiPolygon features, including holes and FeatureCollections.
 */
export function findStopZones(stop: Pick<Stop, 'latitude' | 'longitude'>, zones: StopZone[], agencyIds: string[]): string[] {
	//

	//
	// Restrict the available zones before checking the stop coordinates

	const candidates = zones.filter(zone => zone.agency_ids.some(id => agencyIds.includes(id)));

	if (!candidates.length || !Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude)) return [];

	//
	// GeoJSON positions use longitude first, then latitude

	const point = [stop.longitude, stop.latitude];

	//
	// Match any polygon within a zone, returning each matching zone ID only once

	return [...new Set(candidates.filter((zone) => {
		//

		//
		// Treat single features and collections uniformly

		const features = !zone.geojson ? [] : zone.geojson.type === 'FeatureCollection' ? zone.geojson.features : [zone.geojson];

		return features.some(({ geometry }) => {
			//
			// Expand MultiPolygons into individual polygons and ignore non-area geometry

			const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];

			return polygons.some((rings) => {
				//
				// Include polygon boundaries, including the edges of holes

				if (rings.some(coordinates => booleanPointOnLine(point, { geometry: { coordinates, type: 'LineString' }, properties: {}, type: 'Feature' }))) return true;

				//
				// Reuse the outer-ring helper for each ring: inside the outline, outside every hole

				const insideRing = (coordinates: number[][]) => isPointInPolygon(point, { geometry: { coordinates: [coordinates], type: 'Polygon' }, properties: {}, type: 'Feature' });

				return rings.length > 0 && insideRing(rings[0]) && !rings.slice(1).some(insideRing);
			});
		});
	}).map(zone => zone._id))].sort();
}

/* * */

/**
 * Populates only empty zone assignments on individual Pattern stop occurrences.
 * Preserves manual overrides, including different assignments on repeated visits to the same stop.
 * Leaves the original path untouched and keeps unmatched occurrences unchanged.
 */
export function populateEmptyPathZones<T extends Pick<Path, 'stop_id' | 'zones'>>(path: T[], zonesByStop: Record<string, string[]>): T[] {
	//

	return path.map(item => item.zones?.length || !zonesByStop[item.stop_id]?.length ? item : { ...item, zones: [...zonesByStop[item.stop_id]] });
}
