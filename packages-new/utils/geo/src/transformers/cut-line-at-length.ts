/* * */

import { getDistanceBetweenPositions } from '@/measurements/distance-between-points.js';
import { interpolatePositions } from '@/measurements/interpolate.js';
import { type GeoJsonLineStringGeometry, GeoJsonLineStringGeometrySchema, GeoJsonPosition } from '@tmlmobilidade/go-types-geo';

/**
 * Cuts a LineString at a specified length.
 * If the line is shorter than the specified length, it returns the entire line.
 * @param inputLineString The LineString to cut.
 * @param length The length at which to cut the line, in meters, from the start of the line.
 * @param direction The direction in which to cut the line. If 'forward', it cuts from the start of the line.
 * @returns A new LineString that is cut at the specified length.
 */
export function cutLineStringAtLength(inputLineString: GeoJsonLineStringGeometry, length: number, direction: 'forward' | 'reversed' = 'forward'): GeoJsonLineStringGeometry | null {
	//

	//
	// Return the input line string if it is empty,
	// or null if the length is less than or equal to 0.

	if (inputLineString.coordinates.length < 2) throw new Error('LineString must have at least 2 coordinates.');

	if (length <= 0) throw new Error('Length must be greater than 0.');

	//
	// Reverse the line if the direction is 'reversed'

	if (direction === 'reversed') {
		inputLineString.coordinates = inputLineString.coordinates.slice().reverse();
	}

	//
	// Hold the cumulative distance between points
	// and the coordinates of the new line

	let cumulativeLength = 0;

	const newLineStringCoordinates: GeoJsonPosition[] = [];

	//
	// Loop through the coordinates of the line

	for (let i = 0; i < inputLineString.coordinates.length - 1; i++) {
		// Get the coordinates of the current and the next point
		const coordA = inputLineString.coordinates[i];
		const coordB = inputLineString.coordinates[i + 1];
		// Calculate the distance between the two points
		const segmentLength = getDistanceBetweenPositions(coordA, coordB);
		// If the current segment length plus the cumulative length
		// extends the desired length of the resulting string
		// then the line should be cut at the interpolation point
		if (cumulativeLength + segmentLength >= length) {
			const remainingLength = length - cumulativeLength;
			const relativePositionOnSegment = remainingLength / segmentLength;
			const interpolated = interpolatePositions(coordA, coordB, relativePositionOnSegment);
			newLineStringCoordinates.push(coordA, interpolated);
			return GeoJsonLineStringGeometrySchema.parse({
				coordinates: newLineStringCoordinates,
				type: 'LineString',
			});
		}
		// Add the length of the current segment to the
		// cumulative length of the line up until this point
		cumulativeLength += segmentLength;
		// If the cumulative length is already greater than the desired length
		// then the line should be cut at this point. Break the loop now.
		if (cumulativeLength > length) break;
		// If the cumulative length is not yet up to the desired length
		// then the current point should be added to the new line
		newLineStringCoordinates.push(coordA);
	}

	//
	// If the entire line is shorter than the target length,
	// then return the full line string as is.

	newLineStringCoordinates.push(inputLineString.coordinates[inputLineString.coordinates.length - 1]);

	return GeoJsonLineStringGeometrySchema.parse({
		coordinates: newLineStringCoordinates,
		type: 'LineString',
	});
}
