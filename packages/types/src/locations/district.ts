/**
 * This type represents the properties of a District,
 * both for the geojson feature and the flattened codebase type.
 */
export interface DistrictProperties {
	area_ha: number
	name: string
}

/**
 * This type represents the MongoDB document structure for a District,
 * including the full GeoJSON Feature with geometry and properties.
 */
export interface DistrictFeature extends GeoJSON.Feature<GeoJSON.Polygon> {
	_id: string
	properties: DistrictProperties
}

/**
 * This type represents the flattened codebase structure for a District,
 * with properties at the top level and the full GeoJSON Feature in a separate field.
 * This type should be used throughout the application code.
 */
export interface District extends DistrictProperties {
	_id: string
};
