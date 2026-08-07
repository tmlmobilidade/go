/* * */

import { geoFilter } from '@/utils/geo-filter.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Municipality } from '@tmlmobilidade/types';

/* * */

/**
 * Finds the municipality containing the given coordinates.
 * @param lat - Latitude of the point.
 * @param lon - Longitude of the point.
 * @returns The matching municipality, or null if none contains the point.
 */
export async function findByGeo(lat: number, lon: number): Promise<Municipality | null> {
	const municipality = await goDb.locations.municipalities.findOne(geoFilter(lat, lon));
	if (!municipality) return null;
	return { _id: municipality._id, ...municipality.properties };
}
