import { type PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveShapeAnchors } from '../src/utils/shape-anchors';
import { normalizeShapeEditorDraft, type ShapeEditorDraft, updateShapeEditorDraft } from '../src/utils/shape-editor-draft';
import { copyDefaultStopParameters } from '../src/utils/stops-parameters';

/* * */

function occurrence(id: string, stopId: string): PatternsDetailPathItem {
	return { _id: id, allow_drop_off: true, allow_pickup: true, distance_delta: 100, stop: null, stop_id: stopId, timepoint: true };
}
const path = [occurrence('A1', '100001'), occurrence('B1', '100002'), occurrence('A2', '100001'), occurrence('B2', '100002')];
const parameters = [{ kind: 'default' as const, path: path.map((item, index) => ({ avg_speed: 10 + index, dwell_time: 30 + index, stop_id: item.stop_id })) }];
const legacyAnchor = { _id: 'legacy-A-B', after_stop_id: '100001', before_stop_id: '100002', lat: 38.7, lon: -9.1, sequence: 0, type: 'via' as const };

test('repeated stop parameters follow occurrence IDs through reordering without mutating the source draft', () => {
	const original: ShapeEditorDraft = { parameters, path };
	const snapshot = structuredClone(original);
	const result = updateShapeEditorDraft(original, [path[2], path[1], path[0], path[3]], undefined);
	assert.deepEqual(result.parameters?.[0].path.map(item => item.avg_speed), [12, 11, 10, 13]);
	assert.deepEqual(result.parameters?.[0].path.map(item => item.dwell_time), [32, 31, 30, 33]);
	assert.deepEqual(original, snapshot);
});

test('new visits initialize independently and removed visits cannot leak their values into a duplicate stop', () => {
	const original: ShapeEditorDraft = { parameters, path };
	const result = updateShapeEditorDraft(original, [path[2], occurrence('A3', '100001')], undefined);
	assert.deepEqual(result.parameters?.[0].path, [parameters[0].path[2], { avg_speed: 0, dwell_time: 30, stop_id: '100001' }]);
});

test('an explicit empty shape draft retains no stale geometry', () => {
	const initial: ShapeEditorDraft = { parameters, path, shape: { extension: 100, geojson: { geometry: { coordinates: [[-9.1, 38.7], [-9.2, 38.8]], type: 'LineString' }, type: 'Feature' } } };
	const cleared = updateShapeEditorDraft(initial, [], undefined);
	assert.equal(cleared.shape, undefined);
	assert.deepEqual(cleared.parameters?.[0].path, []);
	assert.notEqual(JSON.stringify(cleared), JSON.stringify(initial));
});

test('legacy A→B on A1→B1→A2→B2 is reported as ambiguous, never duplicated onto both segments', () => {
	const resolved = resolveShapeAnchors(path, [legacyAnchor]);
	assert.deepEqual(resolved.anchors, []);
	assert.equal(resolved.issues[0].anchorId, 'legacy-A-B');
	assert.equal(resolved.issues[0].reason, 'ambiguous');
	assert.deepEqual(resolved.issues[0].candidates.map(item => [item.afterId, item.beforeId]), [['A1', 'B1'], ['A2', 'B2']]);
});

test('occurrence-aware anchors select only their intended loop segment', () => {
	const resolved = resolveShapeAnchors(path, [{ ...legacyAnchor, after_path_item_id: 'A2', before_path_item_id: 'B2' }]);
	assert.deepEqual(resolved.issues, []);
	assert.equal(resolved.anchors[0].after_path_item_id, 'A2');
	assert.equal('after_stop_id' in resolved.anchors[0], false);
});

test('an unambiguous legacy pair gains occurrence IDs while orphaned anchors are identified', () => {
	const resolved = resolveShapeAnchors(path.slice(0, 3), [legacyAnchor, { ...legacyAnchor, _id: 'missing', before_stop_id: '100003' }]);
	assert.equal(resolved.anchors[0].after_path_item_id, 'A1');
	assert.equal(resolved.anchors[0].before_path_item_id, 'B1');
	assert.equal(resolved.issues[0].reason, 'missing');
});

test('legacy duplicate path IDs repair locally without changing positional parameter values', () => {
	const legacy = { parameters, path: path.map(item => ({ ...item, _id: item.stop_id })) };
	const before = structuredClone(legacy);
	let counter = 0;
	const repaired = normalizeShapeEditorDraft(legacy, () => `repair-${++counter}`);
	assert.equal(new Set(repaired.path.map(item => item._id)).size, 4);
	assert.deepEqual(repaired.parameters, parameters);
	assert.deepEqual(legacy, before);
});

test('copying defaults preserves different values for repeated visits to the same stop', () => {
	const current = parameters[0].path.map(item => ({ ...item, avg_speed: 0, dwell_time: 0 }));
	const copied = copyDefaultStopParameters(current, parameters[0].path);
	assert.deepEqual(copied, parameters[0].path);
	assert.deepEqual(current.map(item => item.avg_speed), [0, 0, 0, 0]);
});
