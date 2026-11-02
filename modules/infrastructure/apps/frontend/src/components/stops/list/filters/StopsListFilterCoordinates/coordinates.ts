import { distance } from '@turf/turf';

/* * */

export const STOPS_COORDINATES_RADIUS_METERS = 100;

/** Parses decimal latitude, longitude without rounding the search centre. */
export function parseStopsListCoordinates(value: string): [number, number] | null {
	const match = value.trim().match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
	if (!match) return null;
	const latitude = Number(match[1]);
	const longitude = Number(match[2]);
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
	return [longitude, latitude];
}

/** Includes the boundary, allowing only floating point calculation noise. */
export function isWithinStopsListCoordinatesRadius(center: [number, number], stop: { latitude: number, longitude: number }): boolean {
	if (!Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude)) return false;
	return distance(center, [stop.longitude, stop.latitude], { units: 'meters' }) <= STOPS_COORDINATES_RADIUS_METERS + 1e-5;
}
