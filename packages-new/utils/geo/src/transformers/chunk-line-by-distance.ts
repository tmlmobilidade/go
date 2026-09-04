/*  * */

import { getDistanceBetweenPositions } from '@/measurements/distance-between-points.js';
import { interpolatePositions } from '@/measurements/interpolate.js';
import { type GeoJsonLineStringGeometry, GeoJsonLineStringGeometrySchema, type GeoJsonPosition } from '@tmlmobilidade/go-types-geo';

/**
 * Resamples a GeoJSON LineString into equidistant points by walking the full
 * cumulative distance of the polyline. This function accumulates distance from
 * the start of the line to each vertex, and places nodes at exact `segmentLength` intervals,
 * interpolating between vertices. This means that on long "straight" segments, the output will have
 * more points than on curves, and on short "curved" segments, the output will have fewer points,
 * maintaining the same overall length of the line and of each chunked segment.
 * @param inputLineString The LineString to resample.
 * @param segmentLength The target distance between consecutive output points, in meters.
 * @returns A GeoJSON LineString with equidistant coordinates along the original path.
 */
export function chunkLineStringByDistance(inputLineString: GeoJsonLineStringGeometry, segmentLength: number): GeoJsonLineStringGeometry {
	//

	if (inputLineString.coordinates.length < 2) throw new Error('LineString must have at least 2 coordinates.');

	//
	// Pre-compute cumulative distances at each original vertex

	const cumDist: number[] = [0];

	for (let i = 0; i < inputLineString.coordinates.length - 1; i++) {
		cumDist.push(cumDist[i] + getDistanceBetweenPositions(inputLineString.coordinates[i], inputLineString.coordinates[i + 1]));
	}

	//
	// If the total length is 0, then return the input line string as is.

	const totalLength = cumDist[cumDist.length - 1];

	if (totalLength === 0) return inputLineString;

	const result: GeoJsonPosition[] = inputLineString.coordinates;

	//
	// Walk the polyline placing a node every segmentLength meters

	let segmentIndex = 0;

	const nodeCount = Math.floor(totalLength / segmentLength);

	for (let n = 1; n <= nodeCount; n++) {
		// Calculate the target distance for the current node
		const targetDist = n * segmentLength;
		// Advance segmentIndex to the segment that contains targetDist
		while (segmentIndex < inputLineString.coordinates.length - 2 && cumDist[segmentIndex + 1] < targetDist) {
			segmentIndex++;
		}
		// Calculate the start and end of the segment
		const segStart = cumDist[segmentIndex];
		const segEnd = cumDist[segmentIndex + 1];
		const ratio = segEnd > segStart ? (targetDist - segStart) / (segEnd - segStart) : 0;
		// Interpolate the position of the node between the start and end of the segment
		result.push(interpolatePositions(inputLineString.coordinates[segmentIndex], inputLineString.coordinates[segmentIndex + 1], ratio));
	}

	return GeoJsonLineStringGeometrySchema.parse({
		coordinates: result,
		type: 'LineString',
	});
}
