import { PatternSchema } from '@tmlmobilidade/go-types-offer';
import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';

const initial = PatternSchema.parse({
	_id: 'pattern', code: '1', created_at: 1800000000000, created_by: 'user', destination: 'End', headsign: 'End', line_id: 'line', origin: 'Start', path: [{ _id: 'override', stop_id: '100001', zones: ['custom'] }, { _id: 'empty', stop_id: '100001', zones: [] }, { _id: 'missing', stop_id: '100001' }], route_id: 'route',
	updated_at: 1800000000000,
});
let STORED = structuredClone(initial);
let LINE_LOCKED = false;
let ROUTE_LOCKED = false;
let NO_ZONES = false;
let OUTSIDE = false;
let CONFLICT = false;
let WRITES = 0;
let READS = 0;
let CURSOR_CLOSES = 0;
let STREAM_FAILS = false;
const polygon = { geometry: { coordinates: [[[-10, 38], [-8, 38], [-8, 40], [-10, 40], [-10, 38]]], type: 'Polygon' }, properties: null, type: 'Feature' };
mock.module('@tmlmobilidade/go-interfaces-godb', { namedExports: { goDb: {
	infrastructure: { stops: { findMany: async () => {
		READS++;
		if (CONFLICT && STORED.path) STORED.path[1].zones = ['concurrent'];
		return [{ _id: '100001', latitude: OUTSIDE ? 41 : 39, longitude: -9 }];
	} } },
	offer: {
		lines: { findById: async () => ({ _id: 'line', agency_id: 'A', is_locked: LINE_LOCKED }), findMany: async () => [{ _id: 'line', agency_id: 'A', is_locked: false }] },
		patterns: {
			getCollection: async () => {
				return {
					find: () => {
						const cursor = {
							batchSize: (size: number) => {
								assert.equal(size, 100);
								return cursor;
							},
							close: async () => { CURSOR_CLOSES++; },
							stream: async function* () {
								yield structuredClone(STORED);
								if (STREAM_FAILS) throw new Error('Stream failed');
							},
						};
						return cursor;
					},
					updateOne: async (filter: { is_locked: boolean, path: unknown, updated_at: number }, update: { $push: { comments: typeof STORED.comments[number] }, $set: Partial<typeof STORED> }) => {
						assert.equal(filter.is_locked, false);
						if (STORED.is_locked || JSON.stringify(filter.path) !== JSON.stringify(STORED.path) || filter.updated_at !== STORED.updated_at) return { modifiedCount: 0 };
						STORED = { ...STORED, ...update.$set, comments: [...STORED.comments, update.$push.comments] };
						WRITES++;
						return { modifiedCount: 1 };
					} };
			},
		},
		routes: { findById: async () => ({ _id: 'route', is_locked: ROUTE_LOCKED, line_id: 'line' }) },
		zones: { findMany: async () => NO_ZONES ? [] : [{ _id: 'zone', agency_ids: ['A'], geojson: polygon }] },
	},
} } });
const { populateStopZonesTask } = await import('../src/tasks/populate-stop-zones.js');

beforeEach(() => {
	STORED = structuredClone(initial);
	LINE_LOCKED = false;
	ROUTE_LOCKED = false;
	NO_ZONES = false;
	OUTSIDE = false;
	CONFLICT = false;
	WRITES = 0;
	READS = 0;
	CURSOR_CLOSES = 0;
	STREAM_FAILS = false;
});

test('backfill preserves overrides, fills every empty occurrence and atomically records dated System history', async () => {
	await populateStopZonesTask();
	assert.equal(WRITES, 1);
	assert.deepEqual(STORED.path?.map(item => item.zones), [['custom'], ['zone'], ['zone']]);
	assert.equal(STORED.comments.length, 1);
	assert.equal(STORED.comments[0].created_by, 'System');
	assert.equal(STORED.comments[0].type, 'field_changed');
	assert.equal(CURSOR_CLOSES, 1);
	assert.ok(STORED.comments[0].created_at > 1700000000000);
	CURSOR_CLOSES = 0;
	await populateStopZonesTask();
	assert.equal(WRITES, 1);
	assert.equal(STORED.comments.length, 1);
});

test('locked hierarchy members and concurrently edited occurrences are preserved', async () => {
	STORED.is_locked = true;
	await populateStopZonesTask();
	assert.equal(WRITES, 0);
	STORED.is_locked = false;
	CURSOR_CLOSES = 0;
	LINE_LOCKED = true;
	await populateStopZonesTask();
	assert.equal(WRITES, 0);
	LINE_LOCKED = false;
	ROUTE_LOCKED = true;
	CURSOR_CLOSES = 0;
	await populateStopZonesTask();
	assert.equal(WRITES, 0);
	ROUTE_LOCKED = false;
	CONFLICT = true;
	CURSOR_CLOSES = 0;
	await populateStopZonesTask();
	assert.equal(WRITES, 0);
	assert.deepEqual(STORED.path?.[1].zones, ['concurrent']);
	assert.equal(STORED.comments.length, 0);
});

test('outside stops generate no changes or history and no configured zones skip stop lookups', async () => {
	OUTSIDE = true;
	await populateStopZonesTask();
	assert.equal(WRITES, 0);
	assert.equal(STORED.comments.length, 0);
	READS = 0;
	NO_ZONES = true;
	await populateStopZonesTask();
	assert.equal(READS, 0);
});

test('the cursor is closed when streaming fails after processing a pattern', async () => {
	STREAM_FAILS = true;
	await assert.rejects(populateStopZonesTask(), /Stream failed/);
	assert.equal(WRITES, 1);
	assert.equal(CURSOR_CLOSES, 1);
});
