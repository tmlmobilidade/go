/* * */

import { isSupportedCountry, LOCATION_LEVELS, LOCATION_SLOTS, toLocationItem } from '@/levels.js';
import { type Location as LocationRow } from '@tmlmobilidade/go-interfaces-locationsdb';
import { type Location, type LocationItem, type LocationSlot } from '@tmlmobilidade/go-types-locations';

/* * */

/**
 * Maps the administrative divisions covering a point onto the country-agnostic slots.
 * @param rows Divisions covering the point (any admin_level), from the locations database.
 * @param locality Nearest `place=locality` point, or null.
 * @param position Coordinates, for error messages only.
 * @throws When the country is unsupported or a required slot has no covering division.
 */
export function resolveLocation(rows: LocationRow[], locality: LocationRow | null, position: [lat: number, lon: number]): Location {
	const countryCode = rows.find(row => row.admin_level === '2')?.tags['ISO3166-1'];
	if (!isSupportedCountry(countryCode)) throw new Error(`Unsupported country "${countryCode}" for coordinates [${position}]`);

	const levels = LOCATION_LEVELS[countryCode];
	const slots = {} as Record<LocationSlot, LocationItem>;
	for (const slot of LOCATION_SLOTS) {
		const row = rows.find(row => row.admin_level === levels[slot]);
		if (!row) throw new Error(`No ${slot} division (admin_level ${levels[slot]}) for coordinates [${position}]`);
		slots[slot] = toLocationItem(row);
	}

	return locality ? { ...slots, neighbourhood: toLocationItem(locality) } : slots;
}
