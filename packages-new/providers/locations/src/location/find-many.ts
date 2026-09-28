/* * */

import { LOCATION_LEVELS, type SupportedCountryCode, toLocationItem } from '@/levels.js';
import { locationsDb } from '@tmlmobilidade/go-interfaces-locationsdb';
import { type LocationItem, type LocationSlot } from '@tmlmobilidade/go-types-locations';

/* * */

/**
 * Lists every division of a country at the given slot, sorted by name.
 * @param country ISO 3166-1 alpha-2 code of a supported country.
 * @param slot Which administrative slot to list (e.g. `secondary` = Portuguese municipalities).
 */
export async function findMany(country: SupportedCountryCode, slot: LocationSlot): Promise<LocationItem[]> {
	const rows = await locationsDb.findLocationsByCountryAndAdminLevel(country, LOCATION_LEVELS[country][slot]);
	return rows.map(toLocationItem);
}
