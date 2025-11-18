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

/**
 * This type represents the MongoDB document structure for a Locality,
 * including the full GeoJSON Feature with geometry and properties.
 */
export interface LocalityFeature extends GeoJSON.Feature<GeoJSON.Polygon> {
	_id: string
	properties: LocalityProperties
}

/**
 * This type represents the flattened codebase structure for a Locality,
 * with properties at the top level and the full GeoJSON Feature in a separate field.
 * This type should be used throughout the application code.
 */
export interface Locality extends LocalityProperties {
	_id: string
};
