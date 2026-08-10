/**
 * This type represents the base location type,
 * both for the geojson feature and the flattened codebase type.
 */
export interface BaseLocation<T> {
	_id: string
	geometry: GeoJSON.Feature<GeoJSON.Polygon>
	properties: T
}
