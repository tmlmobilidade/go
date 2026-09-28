/* * */

import { resolveLocation } from '@/location/resolve-location.js';
import { locationsDb } from '@tmlmobilidade/go-interfaces-locationsdb';
import { type Location } from '@tmlmobilidade/go-types-locations';

/* * */

/** Maximum distance from the point to the nearest `place=locality` used as neighbourhood. */
export const NEIGHBOURHOOD_MAX_DISTANCE_METERS = 5_000;

/**
 * Resolves the administrative divisions containing the given coordinates.
 * @returns Country, primary, secondary and tertiary divisions, plus the nearest locality as neighbourhood when close enough.
 * @throws When the point is outside a supported country or any required slot has no covering division.
 */
export async function findByGeo(lat: number, lon: number): Promise<Location> {
	const [rows, locality] = await Promise.all([
		locationsDb.findLocationsAtPoint(lon, lat),
		locationsDb.findNearestLocality(lon, lat, NEIGHBOURHOOD_MAX_DISTANCE_METERS),
	]);
	return resolveLocation(rows, locality, [lat, lon]);
}
