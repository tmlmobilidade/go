import type { BaseLocation } from './base.js';

/**
 * This type represents the properties of a Parish,
 * both for the geojson feature and the flattened codebase type.
 */
export interface ParishProperties {
	area_ha: number
	district_id: string
	municipality_id: string
	name: string
}

export type ParishFeature = BaseLocation<ParishProperties>;

/**
 * Represents a Parish with its ID and flattened properties.
 */
export interface Parish extends ParishProperties {
	_id: string
}
