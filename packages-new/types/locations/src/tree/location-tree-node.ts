/* * */

/**
 * A location (country, district, municipality, parish, ...) with its
 * administrative children nested under it. Values come from OpenStreetMap.
 */
export interface LocationTreeNode {
	/** OSM admin_level (e.g. `"7"` for Portuguese municipalities). */
	admin_level: string
	children: LocationTreeNode[]
	/** National statistics code (`ref:ine`), when the source has one. */
	code: null | string
	/** Absolute OSM id, unique across all levels. */
	id: string
	name: string
}
