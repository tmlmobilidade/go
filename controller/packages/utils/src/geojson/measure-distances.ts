/* * */

import { METERS_PER_DEGREE } from '@/geojson/constants.js';
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
