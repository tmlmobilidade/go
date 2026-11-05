import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';

let PATTERN = { _id: 'pattern', is_locked: false, line_id: 'line', route_id: 'route' };
let LINE = { _id: 'line', agency_id: 'A', is_locked: false };
let ROUTE = { _id: 'route', is_locked: false, line_id: 'line' };
let HAS_ZONES = true;
let MISSING = false;
let STOP_READS = 0;
const polygon = { geometry: { coordinates: [[[-10, 38], [-8, 38], [-8, 40], [-10, 40], [-10, 38]]], type: 'Polygon' }, properties: null, type: 'Feature' };
mock.module('@tmlmobilidade/go-interfaces-godb', { namedExports: { goDb: {
	infrastructure: { stops: { findMany: async (filter: { _id: { $in: string[] } }) => {
		STOP_READS++;
		assert.deepEqual(filter._id.$in, ['100001']);
		return [{ _id: '100001', latitude: 39, longitude: -9 }];
	} } },
	offer: {
		lines: { findById: async () => LINE },
		patterns: { findById: async () => MISSING ? null : PATTERN },
		routes: { findById: async () => ROUTE },
		zones: { findMany: async (filter: { agency_ids: string }) => {
			assert.equal(filter.agency_ids, 'A');
			return HAS_ZONES ? [{ _id: 'zone', agency_ids: ['A'], geojson: polygon }, { _id: 'foreign', agency_ids: ['B'], geojson: polygon }] : [];
		} },
	},
} } });
const { resolvePatternZonesHandler } = await import('../src/endpoints/patterns/handlers/resolve-zones.js');

beforeEach(() => {
	PATTERN = { _id: 'pattern', is_locked: false, line_id: 'line', route_id: 'route' };
	LINE = { _id: 'line', agency_id: 'A', is_locked: false };
	ROUTE = { _id: 'route', is_locked: false, line_id: 'line' };
	MISSING = false;
	HAS_ZONES = true;
	STOP_READS = 0;
});

async function invoke(body: unknown = { stop_ids: ['100001', '100001'] }, agency = 'A') {
	let status = 200;
	let response: unknown;
	const reply = {
		header: () => reply,
		send: (data: unknown) => {
			response = data;
			return reply;
		},
		status: (code: number) => {
			status = code;
			return reply;
		},
	};
	const request = { body, params: { id: 'pattern' }, permissions: [{ action: 'update', resources: { agency_ids: [agency] }, scope: 'lines' }] };
	await resolvePatternZonesHandler(request as unknown as Parameters<typeof resolvePatternZonesHandler>[0], reply as unknown as Parameters<typeof resolvePatternZonesHandler>[1]);
	return { response: response as { data: Record<string, string[]> }, status };
}

test('draft stop IDs resolve against stored coordinates and only the persisted line agency', async () => {
	const result = await invoke();
	assert.equal(result.status, 200);
	assert.deepEqual(result.response.data, { 100001: ['zone'] });
	assert.equal(STOP_READS, 1);
});

test('agencies without zones return empty defaults without reading stops', async () => {
	HAS_ZONES = false;
	assert.deepEqual((await invoke()).response.data, {});
	assert.equal(STOP_READS, 0);
});

test('invalid requests, inaccessible patterns and hierarchy locks never resolve stops', async () => {
	assert.equal((await invoke({ stop_ids: ['invalid'] })).status, 400);
	assert.equal((await invoke(undefined, 'B')).status, 403);
	for (const entity of [PATTERN, LINE, ROUTE]) {
		entity.is_locked = true;
		assert.equal((await invoke()).status, 409);
		entity.is_locked = false;
	}
	MISSING = true;
	assert.equal((await invoke()).status, 404);
	assert.equal(STOP_READS, 0);
});
