/* * */

import { type GeoJsonPointGeometry, GeoJsonPointGeometrySchema, type GeoJsonPosition, LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-shared';

/**
 * Interpolates between two points at a given ratio (0..1).
 * This is a wrapper function around the `interpolatePosition` function.
 * @param pointA The first point.
 * @param pointB The second point.
 * @param ratio The ratio at which to interpolate (0 = pointA, 1 = pointB).
 * @returns The interpolated point.
 */
export function interpolatePoints(pointA: GeoJsonPointGeometry, pointB: GeoJsonPointGeometry, ratio: number): GeoJsonPointGeometry {
	const result = interpolatePositions(pointA.coordinates, pointB.coordinates, ratio);
	return GeoJsonPointGeometrySchema.parse({
		coordinates: result,
		type: 'Point',
	});
}

/**
 * Linearly interpolates between two positions at a given ratio (0..1).
 * This function is useful for calculating intermediate points
 * along a line segment defined by two positions.
 * @param positionA The first position.
 * @param positionB The second position.
 * @param ratio The ratio at which to interpolate (0 = positionA, 1 = positionB).
 * A ratio of 0.5 would give the midpoint between the two positions.
 * A ratio of 0.25 would give a point closer to positionA.
 * @returns The interpolated position.
 */
export function interpolatePositions(positionA: GeoJsonPosition, positionB: GeoJsonPosition, ratio: number): GeoJsonPosition {
	// Extract coordinates from the points
	const lng = LongitudeSchema.parse(positionA[0] + (positionB[0] - positionA[0]) * ratio);
	const lat = LatitudeSchema.parse(positionA[1] + (positionB[1] - positionA[1]) * ratio);
	// Preserve elevation if present
	if (positionA.length === 3 && positionB.length === 3) {
		const alt = positionA[2] + (positionB[2] - positionA[2]) * ratio;
		return [lng, lat, alt];
	}
	// Return the interpolated position
	return [lng, lat];
}
