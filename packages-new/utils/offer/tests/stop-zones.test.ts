import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { type Zone, ZoneSchema } from '@tmlmobilidade/go-types-offer';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { findStopZones, populateEmptyPathZones } from '../src/stop-zones.js';

const outer = [[-10, 38], [-8, 38], [-8, 40], [-10, 40], [-10, 38]];
const hole = [[-9.5, 38.5], [-8.5, 38.5], [-8.5, 39.5], [-9.5, 39.5], [-9.5, 38.5]];
function zone(_id: string, agencyIds = ['A'], geojson: unknown = { geometry: { coordinates: [outer], type: 'Polygon' }, properties: null, type: 'Feature' }): Pick<Zone, '_id' | 'agency_ids' | 'geojson'> {
	return { _id, agency_ids: agencyIds, geojson: ZoneSchema.shape.geojson.parse(geojson) };
}
const stopCoordinates = StopSchema.pick({ latitude: true, longitude: true });
const stop = stopCoordinates.parse({ latitude: 39, longitude: -9 });

test('defaults use the supplied agencies and return every matching zone once', () => {
	const zones = [zone('A'), zone('B', ['B']), zone('shared', ['A', 'B']), zone('A')];
	assert.deepEqual(findStopZones(stop, zones, []), []);
	assert.deepEqual(findStopZones(stop, zones, ['B']), ['B', 'shared']);
	assert.deepEqual(findStopZones(stop, zones, ['A']), ['A', 'shared']);
	assert.deepEqual(findStopZones(stop, zones, ['missing']), []);
});

test('polygon holes, outer and hole boundaries, missing geometry, non-polygons and outside stops', () => {
	const zones = [zone('hole', ['A'], { geometry: { coordinates: [outer, hole], type: 'Polygon' }, properties: null, type: 'Feature' })];
	assert.deepEqual(findStopZones(stop, zones, ['A']), []);
	assert.deepEqual(findStopZones(stopCoordinates.parse({ latitude: 38.25, longitude: -9 }), zones, ['A']), ['hole']);
	for (const longitude of [-10, -9.5]) assert.deepEqual(findStopZones(stopCoordinates.parse({ ...stop, longitude }), zones, ['A']), ['hole']);
	assert.deepEqual(findStopZones(stopCoordinates.parse({ latitude: 41, longitude: -9 }), zones, ['A']), []);
	assert.deepEqual(findStopZones(stop, [zone('null', ['A'], null), zone('point', ['A'], { geometry: { coordinates: [-9, 39], type: 'Point' }, properties: null, type: 'Feature' })], ['A']), []);
});

test('MultiPolygons and FeatureCollections match any polygon without duplicating a zone', () => {
	const multi = { geometry: { coordinates: [[hole], [outer]], type: 'MultiPolygon' as const }, properties: null, type: 'Feature' as const };
	const zones = [zone('multi', ['A'], multi), zone('collection', ['A'], { features: [multi, multi], type: 'FeatureCollection' })];
	assert.deepEqual(findStopZones(stop, zones, ['A']), ['collection', 'multi']);
});

test('each occurrence preserves its overrides; only empty or missing assignments with matches change', () => {
	const path = [{ _id: 'first', stop_id: '1', zones: ['override'] }, { _id: 'second', stop_id: '1', zones: [] }, { _id: 'third', stop_id: '1' }, { _id: 'outside', stop_id: '2', zones: [] }];
	const result = populateEmptyPathZones(path, { 1: ['default'], 2: [] });
	assert.equal(result[0], path[0]);
	assert.deepEqual(result.slice(1, 3).map(item => item.zones), [['default'], ['default']]);
	assert.equal(result[3], path[3]);
	assert.deepEqual(path[1].zones, []);
	assert.deepEqual(populateEmptyPathZones(result, { 1: ['changed'] }), result);
});
