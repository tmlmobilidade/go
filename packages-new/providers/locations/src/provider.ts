/* * */

import { type SupportedCountryCode } from '@/levels.js';
import * as location from '@/location/index.js';
import * as tree from '@/tree/index.js';
import { type Location, type LocationItem, type LocationSlot, type LocationTreeNode } from '@tmlmobilidade/go-types-locations';

/* * */

class LocationsProviderClass {
	//

	/**
	 * Resolves the administrative divisions containing the given coordinates.
	 * @param lat - Latitude of the point.
	 * @param lon - Longitude of the point.
	 * @returns Country, primary, secondary and tertiary divisions, plus the nearest locality as neighbourhood when close enough.
	 * @throws When the point is outside a supported country or a required division is missing.
	 */
	async findLocationByGeo(lat: number, lon: number): Promise<Location> {
		return location.findByGeo(lat, lon);
	}

	/**
	 * Lists every division of a country at the given slot, sorted by name.
	 * @param country - ISO 3166-1 alpha-2 code of a supported country.
	 * @param slot - Administrative slot (e.g. `secondary` = Portuguese municipalities).
	 */
	async findLocations(country: SupportedCountryCode, slot: LocationSlot): Promise<LocationItem[]> {
		return location.findMany(country, slot);
	}

	/**
	 * Builds the administrative location tree (country → 3 nested slots) for every supported country.
	 * @returns Country root nodes with their nested locations, sourced from the locations (OSM) database.
	 */
	async findTree(): Promise<LocationTreeNode[]> {
		return tree.findTree();
	}
}

/* * */

export const locationsProvider = new LocationsProviderClass();
