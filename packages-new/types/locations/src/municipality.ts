import type { BaseLocation } from './base.js';

/**
 * This type represents the properties of a Municipality,
 * both for the geojson feature and the flattened codebase type.
 */
export interface MunicipalityProperties {
	area_ha: number
	district_id: string
	name: string
}

export type MunicipalityFeature = BaseLocation<MunicipalityProperties>;

/**
 * Represents a Municipality with its ID and flattened properties.
 */
export interface Municipality extends MunicipalityProperties {
	_id: string
}
