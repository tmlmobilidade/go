/* * */

import * as districts from '@/districts/index.js';
import * as localities from '@/localities/index.js';
import * as location from '@/location/index.js';
import * as municipalities from '@/municipalities/index.js';
import * as parishes from '@/parishes/index.js';
import { type District, type Locality, type Municipality, type Parish } from '@tmlmobilidade/types';

/* * */

class LocationsProviderClass {
	//

	/**
	 * Finds the district containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns The matching district, or null if none contains the point.
	 */
	async findDistrictByGeo(...params: Parameters<typeof districts.findByGeo>): Promise<District | null> {
		return districts.findByGeo(...params);
	}

	/**
	 * Finds a district by its identifier.
	 * @param id - District identifier.
	 * @param options - Optional query options.
	 * @returns The district, or null if not found.
	 */
	async findDistrictById(...params: Parameters<typeof districts.findById>): Promise<District | null> {
		return districts.findById(...params);
	}

	/**
	 * Lists districts, optionally filtered by district identifiers.
	 * @param params - Optional filter criteria.
	 * @returns Districts sorted by identifier.
	 */
	async findDistricts(...params: Parameters<typeof districts.findMany>): Promise<District[]> {
		return districts.findMany(...params);
	}

	/**
	 * Lists localities, optionally filtered by district, municipality, or parish identifiers.
	 * @param params - Optional filter criteria.
	 * @returns Localities sorted by identifier.
	 */
	async findLocalities(...params: Parameters<typeof localities.findMany>): Promise<Locality[]> {
		return localities.findMany(...params);
	}

	/**
	 * Finds the locality containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns The matching locality, or null if none contains the point.
	 */
	async findLocalityByGeo(...params: Parameters<typeof localities.findByGeo>): Promise<Locality | null> {
		return localities.findByGeo(...params);
	}

	/**
	 * Finds a locality by its identifier.
	 * @param id - Locality identifier.
	 * @param options - Optional query options.
	 * @returns The locality, or null if not found.
	 */
	async findLocalityById(...params: Parameters<typeof localities.findById>): Promise<Locality | null> {
		return localities.findById(...params);
	}

	/**
	 * Resolves all administrative divisions containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns District, municipality, parish, and locality for the point.
	 * @throws An HTTP BAD_REQUEST error when latitude or longitude is missing.
	 */
	async findLocationByGeo(...params: Parameters<typeof location.findByGeo>) {
		return location.findByGeo(...params);
	}

	/**
	 * Lists municipalities, optionally filtered by district identifiers.
	 * @param params - Optional filter criteria.
	 * @returns Municipalities sorted by identifier.
	 */
	async findMunicipalities(...params: Parameters<typeof municipalities.findMany>): Promise<Municipality[]> {
		return municipalities.findMany(...params);
	}

	/**
	 * Finds the municipality containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns The matching municipality, or null if none contains the point.
	 */
	async findMunicipalityByGeo(...params: Parameters<typeof municipalities.findByGeo>): Promise<Municipality | null> {
		return municipalities.findByGeo(...params);
	}

	/**
	 * Finds a municipality by its identifier.
	 * @param id - Municipality identifier.
	 * @param options - Optional query options.
	 * @returns The municipality, or null if not found.
	 */
	async findMunicipalityById(...params: Parameters<typeof municipalities.findById>): Promise<Municipality | null> {
		return municipalities.findById(...params);
	}

	/**
	 * Finds the parish containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns The matching parish, or null if none contains the point.
	 */
	async findParishByGeo(...params: Parameters<typeof parishes.findByGeo>): Promise<null | Parish> {
		return parishes.findByGeo(...params);
	}

	/**
	 * Finds a parish by its identifier.
	 * @param id - Parish identifier.
	 * @param options - Optional query options.
	 * @returns The parish, or null if not found.
	 */
	async findParishById(...params: Parameters<typeof parishes.findById>): Promise<null | Parish> {
		return parishes.findById(...params);
	}

	/**
	 * Lists parishes, optionally filtered by district or municipality identifiers.
	 * @param params - Optional filter criteria.
	 * @returns Parishes sorted by identifier.
	 */
	async findParishes(...params: Parameters<typeof parishes.findMany>): Promise<Parish[]> {
		return parishes.findMany(...params);
	}
}

/* * */

export const locationsProvider = new LocationsProviderClass();
