/* * */

import { geoFilter } from '@/utils/geo-filter.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Locality } from '@tmlmobilidade/types';

/* * */

/**
 * Finds the locality containing the given coordinates.
 * @param lat - Latitude of the point.
 * @param lon - Longitude of the point.
 * @returns The matching locality, or null if none contains the point.
 */
export async function findByGeo(lat: number, lon: number): Promise<Locality | null> {
	const locality = await goDb.locations.localities.findOne(geoFilter(lat, lon));
	if (!locality) return null;
	return { _id: locality._id, ...locality.properties };
}
