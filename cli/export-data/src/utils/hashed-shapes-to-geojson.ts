/* * */

import { HashedShape } from '@tmlmobilidade/types';
import { Feature, FeatureCollection, LineString, Position } from 'geojson';

/* * */

export function hashedShapesToFeatureCollection(hashedShapes: HashedShape | HashedShape[]): FeatureCollection<LineString, GeoJSON.GeoJsonProperties> {
	function toFeature(shape: HashedShape): Feature<LineString, GeoJSON.GeoJsonProperties> {
		return {
			geometry: {
				coordinates: shape.points.map(point => [point.shape_pt_lon, point.shape_pt_lat] as Position),
				type: 'LineString',
			},
			properties: {
				agency_id: shape.agency_id,
				shape_id: shape._id,
			},
			type: 'Feature',
		};
	}

	if (Array.isArray(hashedShapes)) {
		return {
			features: hashedShapes.map(toFeature),
			type: 'FeatureCollection',
		};
	} else {
		return {
			features: [toFeature(hashedShapes)],
			type: 'FeatureCollection',
		};
	}
}
