import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PatternPathParametersSchema, ShapeAnchorSchema, ShapeSchema, UpdatePatternSchema } from '../src/network/pattern.js';

/* * */

const path = [{ _id: 'A1', stop_id: '100001' }, { _id: 'A2', stop_id: '100001' }];
const geometry = { geometry: { coordinates: [[-9.1, 38.7], [-9.2, 38.8]], type: 'LineString' }, type: 'Feature' };

test('shape updates distinguish clearing geometry from omitting it', () => {
	assert.equal(UpdatePatternSchema.parse({ shape: null }).shape, null);
	assert.equal('shape' in UpdatePatternSchema.parse({}), false);
});

test('anchors accept occurrence identities and legacy stop pairs but reject partial or absent identities', () => {
	const anchor = { _id: 'anchor', lat: 38.7, lon: -9.1 };
	assert.equal(ShapeAnchorSchema.safeParse({ ...anchor, after_path_item_id: 'A1', before_path_item_id: 'A2' }).success, true);
	assert.equal(ShapeAnchorSchema.safeParse({ ...anchor, after_stop_id: '100001', before_stop_id: '100002' }).success, true);
	assert.equal(ShapeAnchorSchema.safeParse(anchor).success, false);
	assert.equal(ShapeAnchorSchema.safeParse({ ...anchor, after_path_item_id: 'A1' }).success, false);
	assert.equal(ShapeAnchorSchema.safeParse({ ...anchor, after_path_item_id: 'A1', before_path_item_id: 'A2', lat: 91 }).success, false);
});

test('repeated stops require unique visit IDs and matching positional parameter entries', () => {
	const parameters = [{ kind: 'default', path: [{ avg_speed: 0, dwell_time: 30, stop_id: '100001' }, { avg_speed: 25, dwell_time: 10, stop_id: '100001' }] }];
	assert.equal(PatternPathParametersSchema.safeParse({ parameters, path }).success, true);
	assert.equal(PatternPathParametersSchema.safeParse({ parameters, path: [path[0], path[0]] }).success, false);
	assert.equal(PatternPathParametersSchema.safeParse({ parameters, path: [path[0]] }).success, false);
	assert.equal(PatternPathParametersSchema.safeParse({ parameters: [{ kind: 'default', path: [{ avg_speed: 25, dwell_time: 10, stop_id: '100002' }] }], path: [path[0]] }).success, false);
});

test('persisted shape contracts reject invalid geometry and negative measurements', () => {
	assert.equal(ShapeSchema.safeParse({ extension: 100, geojson: geometry }).success, true);
	assert.equal(ShapeSchema.safeParse({ extension: -1, geojson: geometry }).success, false);
	assert.equal(ShapeSchema.safeParse({ extension: 100, geojson: { ...geometry, geometry: { coordinates: [[200, 38.7]], type: 'LineString' } } }).success, false);
	assert.equal(ShapeSchema.safeParse({ extension: 100, geojson: { ...geometry, geometry: { coordinates: [[-9.1, 38.7]], type: 'Point' } } }).success, false);
});
