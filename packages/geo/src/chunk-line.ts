/*  * */

import { toLineStringFromPositions } from '@/conversions.js';
import { getDistanceBetweenPositions, interpolatePositions } from '@/measurements.js';
import { type LineString, type Position } from 'geojson';

/**
 * This function takes a GeoJSON LineString and splits it into equal chunks of a given precision
 * using a custom implementation. This is useful to ensure greater precision when calculating the nearest
 * point on a path, as some paths may have very long "straight" segments with only two points.
 * @param line The LineString to be split into chunks.
 * @param segmentLength The length of each segment in meters.
 * @returns A GeoJSON LineString with the split chunks.
 */
export function chunkLineByDistance(line: LineString, segmentLength: number): LineString {
	//

	//
	// Exit early if the line is empty

	if (line.coordinates.length < 2) return line;

	//
	// Setup variables to hold the coordinates of the chunked line

	const chunkedLineCoordinates: Position[] = [];

	//
	// Add the first point to the chunked line

	chunkedLineCoordinates.push(line.coordinates[0]);

	//
	// Loop through the coordinates of the line

	for (let i = 0; i < line.coordinates.length - 1; i++) {
		// Extract the coordinates of the current and the next point
		const [lngA, latA] = line.coordinates[i];
		const [lngB, latB] = line.coordinates[i + 1];
		// Calculate the length of the current segment
		const currentSegmentLength = getDistanceBetweenPositions(line.coordinates[i], line.coordinates[i + 1]);
		// If the current segment length is greater than the desired segment length
		if (currentSegmentLength > segmentLength) {
			// Calculate the number of segments needed to fill the current segment
			const segmentsNeeded = Math.floor(currentSegmentLength / segmentLength);
			// Calculate the length of each chunked segment
			const chunkedSegmentLength = currentSegmentLength / segmentsNeeded;
			// Calculate the remaining distance to be filled
			let remainingDist = segmentLength;
			// Loop through the segments needed
			for (let j = 0; j < segmentsNeeded; j++) {
				// Calculate the ratio of the segment
				const ratio = remainingDist / chunkedSegmentLength;
				// Interpolate the coordinates of the segment
				const interpolated = interpolatePositions([lngA, latA], [lngB, latB], ratio);
				// Add the interpolated coordinates to the chunked line
				chunkedLineCoordinates.push(interpolated);
				// Update the remaining distance to be filled
				remainingDist -= chunkedSegmentLength;
			}
			// Add the last point of the segment to the chunked line
			const lastPoint = line.coordinates[i + 1];
			if (chunkedLineCoordinates[chunkedLineCoordinates.length - 1][0] !== lastPoint[0] || chunkedLineCoordinates[chunkedLineCoordinates.length - 1][1] !== lastPoint[1]) {
				chunkedLineCoordinates.push(lastPoint);
			}
		} else {
			// If the current segment length is less than or equal to the desired segment length
			// Add the current point to the chunked line
			if (chunkedLineCoordinates[chunkedLineCoordinates.length - 1][0] !== line.coordinates[i][0] || chunkedLineCoordinates[chunkedLineCoordinates.length - 1][1] !== line.coordinates[i][1]) {
				chunkedLineCoordinates.push(line.coordinates[i]);
			}
		}
	}

	//
	// Add the last point of the line to the chunked line

	const lastPoint = line.coordinates[line.coordinates.length - 1];

	if (chunkedLineCoordinates[chunkedLineCoordinates.length - 1][0] !== lastPoint[0] || chunkedLineCoordinates[chunkedLineCoordinates.length - 1][1] !== lastPoint[1]) {
		chunkedLineCoordinates.push(lastPoint);
	}

	//
	// Return the chunked line as a GeoJSON LineString

	return toLineStringFromPositions(chunkedLineCoordinates);

	//
}

/**
 * Resamples a GeoJSON LineString into equidistant points by walking the full
 * cumulative distance of the polyline. Unlike `chunkLineByDistance` which
 * processes each segment independently (producing short chunks on curves),
 * this function accumulates distance across all original vertices and places
 * nodes at exact `segmentLength` intervals, interpolating between vertices.
 * @param line The LineString to resample.
 * @param segmentLength The target distance between consecutive output points, in meters.
 * @returns A GeoJSON LineString with equidistant coordinates along the original path.
 */
export function chunkLineByDistanceV2(line: LineString, segmentLength: number): LineString {
	//

	if (line.coordinates.length < 2) return line;

	const coords = line.coordinates;

	// Pre-compute cumulative distances at each original vertex
	const cumDist: number[] = [0];
	for (let i = 0; i < coords.length - 1; i++) {
		cumDist.push(cumDist[i] + getDistanceBetweenPositions(coords[i], coords[i + 1]));
	}

	const totalLength = cumDist[cumDist.length - 1];
	if (totalLength === 0) return line;

	const result: Position[] = [coords[0]];

	// Walk the polyline placing a node every segmentLength meters
	let segIdx = 0;
	const nodeCount = Math.floor(totalLength / segmentLength);

	for (let n = 1; n <= nodeCount; n++) {
		const targetDist = n * segmentLength;

		// Advance segIdx to the segment that contains targetDist
		while (segIdx < coords.length - 2 && cumDist[segIdx + 1] < targetDist) {
			segIdx++;
		}

		const segStart = cumDist[segIdx];
		const segEnd = cumDist[segIdx + 1];
		const ratio = segEnd > segStart ? (targetDist - segStart) / (segEnd - segStart) : 0;

		result.push(interpolatePositions(coords[segIdx], coords[segIdx + 1], ratio));
	}

	return toLineStringFromPositions(result);

	//
}
