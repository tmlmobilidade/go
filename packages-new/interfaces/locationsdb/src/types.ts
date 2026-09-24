/* * */

import { type FeatureCollection, type Geometry } from 'geojson';

/* * */

/** OSM tag bag stored as jsonb on planet_osm_polygon. */
export type OsmTags = Record<string, string>;

/** Properties embedded in each GeoJSON Feature of a location. */
export interface LocationProperties {
	admin_level: null | string
	code: null | string
	name: null | string
	tags: OsmTags
}

/** Location row from planet_osm_polygon. */
export interface Location extends LocationProperties {
	id: string
}

/** Location row including a GeoJSON FeatureCollection of its geometry. */
export interface LocationWithGeojson extends Location {
	geojson: FeatureCollection<Geometry, LocationProperties>
}
