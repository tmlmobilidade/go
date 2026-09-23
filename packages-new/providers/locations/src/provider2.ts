/* * */

import * as districts from '@/districts/index.js';
import * as localities from '@/localities/index.js';
import * as location from '@/location/index.js';
import * as municipalities from '@/municipalities/index.js';
import * as parishes from '@/parishes/index.js';
import { type District, type Locality, type Municipality, type Parish } from '@tmlmobilidade/go-types-locations';

/* * */

class LocationsProviderClass {
	//

	/**
	 * Finds the district containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns The matching district, or null if none contains the point.
	 */
	async findDistrictByGeo(lat: number, lon: number): Promise<District | null> {
		return districts.findByGeo(lat, lon);
	}

	/**
	 * Finds a district by its identifier.
	 * @param id - District identifier.
	 * @param options - Optional query options.
	 * @returns The district, or null if not found.
	 */
	async findDistrictById(id: string, { geometry = false }: { geometry?: boolean } = {}): Promise<District | null> {
		return districts.findById(id, { geometry });
	}

	/**
	 * Lists districts, optionally filtered by district identifiers.
	 * @param params - Optional filter criteria.
	 * @returns Districts sorted by identifier.
	 */
	async findDistricts({ districtIds }: { districtIds?: string[] } = {}): Promise<District[]> {
		return districts.findMany({ districtIds });
	}

	/**
	 * Lists localities, optionally filtered by district, municipality, or parish identifiers.
	 * @param params - Optional filter criteria.
	 * @returns Localities sorted by identifier.
	 */
	async findLocalities({ districtIds, municipalityIds, parishIds }: { districtIds?: string[], municipalityIds?: string[], parishIds?: string[] } = {}): Promise<Locality[]> {
		return localities.findMany({ districtIds, municipalityIds, parishIds });
	}

	/**
	 * Finds the locality containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns The matching locality, or null if none contains the point.
	 */
	async findLocalityByGeo(lat: number, lon: number): Promise<Locality | null> {
		return localities.findByGeo(lat, lon);
	}

	/**
	 * Finds a locality by its identifier.
	 * @param id - Locality identifier.
	 * @param options - Optional query options.
	 * @returns The locality, or null if not found.
	 */
	async findLocalityById(id: string, { geometry = false }: { geometry?: boolean } = {}): Promise<Locality | null> {
		return localities.findById(id, { geometry });
	}

	/**
	 * Resolves all administrative divisions containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns District, municipality, parish, and locality for the point.
	 * @throws An HTTP BAD_REQUEST error when latitude or longitude is missing.
	 */
	async findLocationByGeo(lat: number, lon: number) {
		return location.findByGeo(lat, lon);
	}

	/**
	 * Lists municipalities, optionally filtered by district identifiers.
	 * @param params - Optional filter criteria.
	 * @returns Municipalities sorted by identifier.
	 */
	async findMunicipalities({ districtIds }: { districtIds?: string[] } = {}): Promise<Municipality[]> {
		return municipalities.findMany({ districtIds });
	}

	/**
	 * Finds the municipality containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns The matching municipality, or null if none contains the point.
	 */
	async findMunicipalityByGeo(lat: number, lon: number): Promise<Municipality | null> {
		return municipalities.findByGeo(lat, lon);
	}

	/**
	 * Finds a municipality by its identifier.
	 * @param id - Municipality identifier.
	 * @param options - Optional query options.
	 * @returns The municipality, or null if not found.
	 */
	async findMunicipalityById(id: string, { geometry = false }: { geometry?: boolean } = {}): Promise<Municipality | null> {
		return municipalities.findById(id, { geometry });
	}

	/**
	 * Finds the parish containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns The matching parish, or null if none contains the point.
	 */
	async findParishByGeo(lat: number, lon: number): Promise<null | Parish> {
		return parishes.findByGeo(lat, lon);
	}

	/**
	 * Finds a parish by its identifier.
	 * @param id - Parish identifier.
	 * @param options - Optional query options.
	 * @returns The parish, or null if not found.
	 */
	async findParishById(id: string, { geometry = false }: { geometry?: boolean } = {}): Promise<null | Parish> {
		return parishes.findById(id, { geometry });
	}

	/**
	 * Lists parishes, optionally filtered by district or municipality identifiers.
	 * @param params - Optional filter criteria.
	 * @returns Parishes sorted by identifier.
	 */
	async findParishes({ districtIds, municipalityIds }: { districtIds?: string[], municipalityIds?: string[], parishIds?: string[] } = {}): Promise<Parish[]> {
		return parishes.findMany({ districtIds, municipalityIds });
	}
}

/* * */

export const locationsProvider = new LocationsProviderClass();
