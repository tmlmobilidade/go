import { type Feature, type LineString, type MultiLineString } from 'geojson';

/* * */

interface RoadStyleLayer {
	'id': string
	'source-layer'?: string
	'type': string
}

// Maps uses the OpenMapTiles transportation source layer. Layer IDs are styling
// details and can change independently of this vector-tile data contract.
const ROAD_SOURCE_LAYER = 'transportation';
const BUS_ROAD_CLASSES = new Set(['minor', 'motorway', 'primary', 'secondary', 'service', 'tertiary', 'track', 'trunk']);

/* * */

export function getBusCandidateRoadLayerIds(layers: readonly RoadStyleLayer[]): string[] {
	return layers
		.filter(layer => layer.type === 'line' && layer['source-layer'] === ROAD_SOURCE_LAYER)
		.map(layer => layer.id);
}

export function isBusCandidateRoadFeature<T extends Feature>(feature: T): feature is Feature<LineString | MultiLineString> & T {
	return (
		(feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString')
		&& typeof feature.properties?.class === 'string'
		&& BUS_ROAD_CLASSES.has(feature.properties.class)
	);
}
