import type { BaseLocation } from './base.js';

/**
 * This type represents the properties of a Locality,
 * both for the geojson feature and the flattened codebase type.
 */
export interface LocalityProperties {
	area_ha: number
	district_id: string
	municipality_id: string
	name: string
	parish_id?: string
}

export type LocalityFeature = BaseLocation<LocalityProperties>;

/**
 * Represents a Locality with its ID and flattened properties.
 */
export interface Locality extends LocalityProperties {
	_id: string
}
