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

/**
 * This type represents the MongoDB document structure for a Parish,
 * including the full GeoJSON Feature with geometry and properties.
 */
export interface ParishFeature extends GeoJSON.Feature<GeoJSON.Polygon> {
	_id: string
	properties: ParishProperties
}

/**
 * This type represents the flattened codebase structure for a Parish,
 * with properties at the top level and the full GeoJSON Feature in a separate field.
 * This type should be used throughout the application code.
 */
export interface Parish extends ParishProperties {
	_id: string
};
