import type { BaseLocation } from './base.js';

/**
 * This type represents the properties of a District,
 * both for the geojson feature and the flattened codebase type.
 */
export interface DistrictProperties {
	area_ha: number
	name: string
}

export type DistrictFeature = BaseLocation<DistrictProperties>;

/**
 * Represents a District with its ID and flattened properties.
 */
export interface District extends DistrictProperties {
	_id: string
}
