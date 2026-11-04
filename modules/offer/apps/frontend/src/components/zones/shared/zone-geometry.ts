import { type Zone } from '@tmlmobilidade/go-types-offer';
import { type MapOverlayPolygonDataProps } from '@tmlmobilidade/ui';
import { type FeatureCollection, type Polygon } from 'geojson';

/* * */

/** Builds a polygon preview for both single features and feature collections. */
export function toZonePolygonPreview(geojson: Zone['geojson']): FeatureCollection<Polygon, MapOverlayPolygonDataProps> {
	const features: FeatureCollection<Polygon, MapOverlayPolygonDataProps>['features'] = [];
	const source = !geojson ? [] : geojson.type === 'FeatureCollection' ? geojson.features : [geojson];

	for (const feature of source) {
		if (feature.geometry.type === 'Polygon') {
			features.push({ geometry: feature.geometry, properties: { id: `polygon-${features.length}` }, type: 'Feature' });
		} else if (feature.geometry.type === 'MultiPolygon') {
			for (const coordinates of feature.geometry.coordinates) {
				features.push({ geometry: { coordinates, type: 'Polygon' }, properties: { id: `polygon-${features.length}` }, type: 'Feature' });
			}
		}
	}

	return { features, type: 'FeatureCollection' };
}
