/* * */

import { type Location as LocationRow } from '@tmlmobilidade/go-interfaces-locationsdb';
import { type LocationItem, type LocationSlot } from '@tmlmobilidade/go-types-locations';

/* * */

/** Slot order, index-aligned with the admin_levels in `LOCATION_LEVELS`. */
export const LOCATION_SLOTS = ['country', 'primary', 'secondary', 'tertiary'] as const satisfies readonly LocationSlot[];

/**
 * OSM admin_levels per slot for each supported country (tried in order until one matches).
 * PT: Country, District|Autonomous Region, Municipality, Parish.
 * ES: Country, Autonomous Community, Province, Municipality.
 */
export const LOCATION_LEVELS: Record<'ES' | 'PT', Record<LocationSlot, readonly string[]>> = {
	ES: { country: ['2'], primary: ['4'], secondary: ['6'], tertiary: ['8'] },
	PT: { country: ['2'], primary: ['6', '4'], secondary: ['7'], tertiary: ['8'] },
};

export type SupportedCountryCode = keyof typeof LOCATION_LEVELS;

export function isSupportedCountry(code: string | undefined): code is SupportedCountryCode {
	return code !== undefined && code in LOCATION_LEVELS;
}

export const SUPPORTED_COUNTRIES = Object.keys(LOCATION_LEVELS) as SupportedCountryCode[];

/** Converts a locations database row into the shape stored on documents (no `code` for now). */
export function toLocationItem(row: LocationRow): LocationItem {
	return { admin_level: row.admin_level ?? '', name: row.name ?? row.id, osm_id: Number(row.id) };
}
