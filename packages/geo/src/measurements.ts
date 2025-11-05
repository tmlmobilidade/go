/* * */

import { METERS_PER_DEGREE } from '@/constants.js';
import { toPointFromPositions } from '@/conversions.js';
import { type Point, type Position } from 'geojson';

/**
 * Calculates the distance between two points, in meters.
 * This is a wrapper function around the `getDistanceBetweenPositions` function.
 * @param pointA The first point.
 * @param pointB The second point.
 * @returns The distance between the two points, in meters.
 */
export function getDistanceBetweenPoints(pointA: Point, pointB: Point): number {
	return getDistanceBetweenPositions(pointA.coordinates, pointB.coordinates);
}

/**
 * Calculates the distance between two coordinate positions, in meters.
 * This function uses the Haversine formula to calculate the distance
 * between two points on the Earth's surface, given their latitude and longitude.
 * The formula accounts for the curvature of the Earth.
 * It is important to note that this function assumes the Earth is a perfect sphere,
 * which is not entirely accurate, but it provides a good approximation for small distances.
 * @param positionA The first position.
 * @param positionB The second position.
 * @returns The distance between the two points, in meters.
 */
export function getDistanceBetweenPositions(positionA: Position, positionB: Position): number {
	// Extract coordinates from the points
	const [lngA, latA] = positionA;
	const [lngB, latB] = positionB;
	// Calculate the average latitude
	const averageLatitude = (latA + latB) / 2;
	// Calculate the differences in longitude and latitude
	const dx = (lngB - lngA) * METERS_PER_DEGREE * Math.cos((averageLatitude * Math.PI) / 180);
	const dy = (latB - latA) * METERS_PER_DEGREE;
	// Calculate the distance using the Pythagorean theorem
	return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Interpolates between two points at a given ratio (0..1).
 * This is a wrapper function around the `interpolatePosition` function.
 * @param pointA The first point.
 * @param pointB The second point.
 * @param ratio The ratio at which to interpolate (0 = pointA, 1 = pointB).
 * @returns The interpolated point.
 */
export function interpolatePoints(pointA: Point, pointB: Point, ratio: number): Point {
	const result = interpolatePositions(pointA.coordinates, pointB.coordinates, ratio);
	return toPointFromPositions(result);
}

/**
 * Linearly interpolates between two positions at a given ratio (0..1).
 * This function is useful for calculating intermediate points
 * along a line segment defined by two positions.
 * @param positionA The first position.
 * @param positionB The second position.
 * @param ratio The ratio at which to interpolate (0 = positionA, 1 = positionB).
 *              A ratio of 0.5 would give the midpoint between the two positions.
 *              A ratio of 0.25 would give a point closer to positionA.
 * @returns The interpolated position.
 */
export function interpolatePositions(positionA: Position, positionB: Position, ratio: number): Position {
	// Extract coordinates from the points
	const lng = positionA[0] + (positionB[0] - positionA[0]) * ratio;
	const lat = positionA[1] + (positionB[1] - positionA[1]) * ratio;
	// Preserve elevation if present
	if (positionA.length > 2 && positionB.length > 2) {
		const alt = positionA[2] + (positionB[2] - positionA[2]) * ratio;
		return [lng, lat, alt];
	}
	// Return the interpolated position
	return [lng, lat];
}
