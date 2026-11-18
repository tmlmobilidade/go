/* * */

import { distance } from '@turf/turf';

/* * */

export const STOPS_COORDINATES_RADIUS_METERS = 100;

// Allow floating point rounding at the 100 m boundary.
const DISTANCE_TOLERANCE_METERS = 1e-5;

/* * */

/**
 * Parses a latitude, longitude pair without rounding the search centre.
 * @param coordinateText Two comma-separated decimal coordinates, latitude first.
 * @returns The centre in GeoJSON order [longitude, latitude], or null for invalid input.
 */
export function parseStopsListCoordinates(coordinateText: string): [longitude: number, latitude: number] | null {
	// Require two complete decimal numbers before converting either value.
	const coordinateMatch = coordinateText.trim().match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
	if (!coordinateMatch) return null;

	const latitude = Number(coordinateMatch[1]);
	const longitude = Number(coordinateMatch[2]);
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

	return [longitude, latitude];
}

/**
 * Checks whether a stop is at or within the fixed 100 m search radius.
 * @param center The search centre in GeoJSON order [longitude, latitude].
 * @param stop The stop coordinates to measure against the centre.
 * @returns Whether the stop is inside the radius, including its boundary.
 */
export function isWithinStopsListCoordinatesRadius(center: [longitude: number, latitude: number], stop: { latitude: number, longitude: number }): boolean {
	if (!Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude)) return false;

	const distanceMeters = distance(center, [stop.longitude, stop.latitude], { units: 'meters' });
	return distanceMeters <= STOPS_COORDINATES_RADIUS_METERS + DISTANCE_TOLERANCE_METERS;
}
