/*  * */

import { getDistanceBetweenPositions } from '@/measurements/distance-between-points.js';
import { interpolatePositions } from '@/measurements/interpolate.js';
import { type GeoJsonLineStringGeometry, GeoJsonLineStringGeometrySchema, type GeoJsonPosition } from '@tmlmobilidade/go-types-geo';

/**
 * Resamples a GeoJSON LineString into equidistant points by walking the full
 * cumulative distance of the polyline. Distance is accumulated from the start of
 * the line to each vertex and a node is placed every `segmentLength` metres,
 * interpolating between the original vertices. The output starts at the first
 * vertex of the input and ends at its last vertex, so the resampled line covers
 * the same extent as the original; every interior node is exactly
 * `segmentLength` metres from the previous one along the path, and the final
 * node is the remainder (0 < remainder <= segmentLength).
 *
 * The original vertices are NOT part of the output (other than the first and
 * last): consumers index nodes by position (`node_index`) and rely on
 * `node_index * segmentLength` being the distance along the path.
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

	// Start from the first vertex only. Seeding the result with the whole input
	// array would emit every raw vertex before the resampled nodes and make the
	// node index walk the route twice.
	const result: GeoJsonPosition[] = [inputLineString.coordinates[0]];

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

	//
	// Close the line at its real end so the last partial segment is not lost.

	if (totalLength > nodeCount * segmentLength) {
		result.push(inputLineString.coordinates[inputLineString.coordinates.length - 1]);
	}

	return GeoJsonLineStringGeometrySchema.parse({
		coordinates: result,
		type: 'LineString',
	});
}
