/* * */

import { geoFilter } from '@/utils/geo-filter.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Parish } from '@tmlmobilidade/go-types-locations';

/* * */

/**
 * Finds the parish containing the given coordinates.
 * @param lat - Latitude of the point.
 * @param lon - Longitude of the point.
 * @returns The matching parish, or null if none contains the point.
 */
export async function findByGeo(lat: number, lon: number): Promise<null | Parish> {
	const parish = await goDb.locations.parishes.findOne(geoFilter(lat, lon));
	if (!parish) return null;
	return { _id: parish._id, ...parish.properties };
}
