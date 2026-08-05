/* * */

import { geoFilter } from '@/utils/geo-filter.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type District } from '@tmlmobilidade/types';

/* * */

/**
 * Finds the district containing the given coordinates.
 * @param lat - Latitude of the point.
 * @param lon - Longitude of the point.
 * @returns The matching district, or null if none contains the point.
 */
export async function findByGeo(lat: number, lon: number): Promise<District | null> {
	const district = await goDb.locations.districts.findOne(geoFilter(lat, lon));
	if (!district) return null;
	return { _id: district._id, ...district.properties };
}
