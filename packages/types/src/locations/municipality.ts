/**
 * This type represents the properties of a Municipality,
 * both for the geojson feature and the flattened codebase type.
 */
export interface MunicipalityProperties {
	area_ha: number
	district_id: string
	name: string
}

/**
 * This type represents the MongoDB document structure for a Municipality,
 * including the full GeoJSON Feature with geometry and properties.
 */
export interface MunicipalityFeature extends GeoJSON.Feature<GeoJSON.Polygon> {
	_id: string
	properties: MunicipalityProperties
}

/**
 * This type represents the flattened codebase structure for a Municipality,
 * with properties at the top level and the full GeoJSON Feature in a separate field.
 * This type should be used throughout the application code.
 */
export interface Municipality extends MunicipalityProperties {
	_id: string
};
