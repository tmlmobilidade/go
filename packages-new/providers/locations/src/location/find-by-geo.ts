/* * */

import * as districts from '@/districts/index.js';
import * as localities from '@/localities/index.js';
import * as municipalities from '@/municipalities/index.js';
import * as parishes from '@/parishes/index.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type District, type Locality, type Municipality, type Parish } from '@tmlmobilidade/go-types-locations';

/* * */

export interface FindByGeoResult {
	district: District | null
	latitude: number
	locality: Locality | null
	longitude: number
	municipality: Municipality | null
	parish: null | Parish
}

/**
 * Resolves all administrative divisions containing the given coordinates.
 * @param lat - Latitude of the point.
 * @param lon - Longitude of the point.
 * @returns District, municipality, parish, and locality for the point.
 * @throws An HTTP BAD_REQUEST error when latitude or longitude is missing.
 */
export async function findByGeo(lat: number, lon: number): Promise<FindByGeoResult> {
	if (!lat || !lon) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing latitude or longitude');

	const [district, locality, municipality, parish] = await Promise.all([
		districts.findByGeo(lat, lon),
		localities.findByGeo(lat, lon),
		municipalities.findByGeo(lat, lon),
		parishes.findByGeo(lat, lon),
	]);

	return {
		district,
		latitude: lat,
		locality,
		longitude: lon,
		municipality,
		parish,
	};
}
