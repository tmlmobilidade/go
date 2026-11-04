import { ZoneSchema } from '@tmlmobilidade/go-types-offer';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { toZonePolygonPreview } from '../src/components/zones/shared/zone-geometry';

/* * */

const ring = [[0, 0], [0, 1], [1, 1], [0, 0]];
const polygon = { geometry: { coordinates: [ring], type: 'Polygon' }, properties: null, type: 'Feature' };
const multiPolygon = { geometry: { coordinates: [[ring], [ring]], type: 'MultiPolygon' }, properties: null, type: 'Feature' };

test('single polygon and multi-polygon previews preserve all area parts', () => {
	const single = toZonePolygonPreview(ZoneSchema.shape.geojson.parse(polygon));
	assert.equal(single.features.length, 1);
	assert.deepEqual(single.features[0].geometry.coordinates, [ring]);
	const multiple = toZonePolygonPreview(ZoneSchema.shape.geojson.parse(multiPolygon));
	assert.equal(multiple.features.length, 2);
	assert.deepEqual(multiple.features.map(feature => feature.geometry.coordinates), [[ring], [ring]]);
});

test('collections preview all polygons, tolerate existing non-area geometry and produce unique IDs', () => {
	const geojson = ZoneSchema.shape.geojson.parse({ features: [polygon, multiPolygon, { geometry: { coordinates: [0, 0], type: 'Point' }, type: 'Feature' }], type: 'FeatureCollection' });
	const preview = toZonePolygonPreview(geojson);
	assert.equal(preview.features.length, 3);
	assert.equal(new Set(preview.features.map(feature => feature.properties.id)).size, 3);
});

test('cleared and empty collections clear the polygon preview', () => {
	assert.deepEqual(toZonePolygonPreview(null), { features: [], type: 'FeatureCollection' });
	assert.deepEqual(toZonePolygonPreview(ZoneSchema.shape.geojson.parse({ features: [], type: 'FeatureCollection' })), { features: [], type: 'FeatureCollection' });
});
