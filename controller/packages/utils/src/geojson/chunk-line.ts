/* * */

import { distanceBetweenCoords } from '@/geojson/distance-between-coords.js';
import { interpolateCoords } from '@/geojson/interpolate-coords.js';
import { type Feature, type LineString, type Position } from 'geojson';

/**
 * This function takes a GeoJSON LineString and splits it into equal chunks of a given precision
 * using a custom implementation. This is useful to ensure greater precision when calculating the nearest
 * point on a path, as some paths may have very long "straight" segments with only two points.
 * @param line A GeoJSON LineString to be split into equal chunks.
 * @param precision The precision used to split the line into equal chunks. Default is 10 meters.
 * @returns A GeoJSON LineString with the split chunks.
 */
export function chunkLineByDistance(line: Feature<LineString>, precision: number): Feature<LineString> {
	const coords = line.geometry.coordinates;
	if (coords.length < 2) {
		throw new Error('LineString must have at least two points');
	}

	const chunked: Position[] = [coords[0]]; // Start with the first point
	let remainingDist = precision;

	for (let i = 0; i < coords.length - 1; i++) {
		let [lng1, lat1] = coords[i];
		const [lng2, lat2] = coords[i + 1];

		const segment = distanceBetweenCoords([lng1, lat1], [lng2, lat2]);

		while (remainingDist < segment) {
			const t = remainingDist / segment;
			const interpolated = interpolateCoords([lng1, lat1], [lng2, lat2], t);
			chunked.push(interpolated);
			// Now treat the new point as the beginning of a shorter segment
			[lng1, lat1] = interpolated;
			remainingDist = precision;
		}

		remainingDist -= segment;
	}

	// Ensure we include the final point
	const last = coords[coords.length - 1];
	if (chunked.length === 0 || (chunked[chunked.length - 1][0] !== last[0] || chunked[chunked.length - 1][1] !== last[1])) {
		chunked.push(last);
	}

	return {
		geometry: {
			coordinates: chunked,
			type: 'LineString',
		},
		properties: {},
		type: 'Feature',
	};
}
