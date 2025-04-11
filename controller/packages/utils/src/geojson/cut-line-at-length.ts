/* * */

import { toLineStringFromPositions } from '@/geojson/conversions.js';
import { getDistanceBetweenPositions, interpolatePositions } from '@/geojson/measurements.js';
import { type LineString, type Position } from 'geojson';

/**
 * Cuts a LineString at a specified length.
 * @param line The LineString to cut.
 * @param length The length at which to cut the line, in meters.
 * @returns A new LineString cut at the specified length.
 */
export function cutLineStringAtLength(line: LineString, length: number): LineString {
	// Return the line if it is empty
	if (line.coordinates.length < 2) return line;
	// Return an empty line if the length is less than or equal to 0
	if (length <= 0) return toLineStringFromPositions();
	// Hold the cumulative distance between points
	// and the coordinates of the new line
	let cumulativeLength = 0;
	const newLinePositions: Position[] = [];
	// Loop through the coordinates of the line
	for (let i = 0; i < line.coordinates.length - 1; i++) {
		// Get the coordinates of the current and the next point
		const coordA = line.coordinates[i];
		const coordB = line.coordinates[i + 1];
		// Calculate the distance between the two points
		const segmentLength = getDistanceBetweenPositions(coordA, coordB);
		// If the current segment length plus the cumulative length
		// extends the desired length of the resulting string
		// then the line should be cut at the interpolation point
		if (cumulativeLength + segmentLength >= length) {
			const remainingLength = length - cumulativeLength;
			const relativePositionOnSegment = remainingLength / segmentLength;
			const interpolated = interpolatePositions(coordA, coordB, relativePositionOnSegment);
			newLinePositions.push(coordA, interpolated);
			return toLineStringFromPositions(newLinePositions);
		}
		// Add the length of the current segment to the
		// cumulative length of the line up until this point
		cumulativeLength += segmentLength;
		// If the cumulative length is already greater than the desired length
		// then the line should be cut at this point. Break the loop now.
		if (cumulativeLength > length) break;
		// If the cumulative length is not yet up to the desired length
		// then the current point should be added to the new line
		newLinePositions.push(coordA);
	}
	// If the entire line is shorter than the target length
	newLinePositions.push(line.coordinates[line.coordinates.length - 1]);
	return toLineStringFromPositions(newLinePositions);
}
