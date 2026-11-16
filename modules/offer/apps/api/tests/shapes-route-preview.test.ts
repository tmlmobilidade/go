import { encodePolylineFromGeoJson } from '@tmlmobilidade/geo';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, mock, test } from 'node:test';

/* * */

let PATTERN = { _id: 'pattern', is_locked: false, line_id: 'line', route_id: 'route' };
let LINE = { _id: 'line', agency_id: 'A', is_locked: false };
let ROUTE = { _id: 'route', is_locked: false, line_id: 'line' };
let MISSING = false;
let CALLS = 0;
let CLOSE_CLIENT = () => {};
const originalFetch = globalThis.fetch;
mock.module('@tmlmobilidade/go-interfaces-godb', { namedExports: { goDb: { offer: {
	lines: { findById: async () => LINE },
	patterns: { findById: async () => MISSING ? null : PATTERN },
	routes: { findById: async () => ROUTE },
} } } });
const { routePreviewHandler } = await import('../src/endpoints/shapes/handlers/route-preview.js');
const body = { pattern_id: 'pattern', points: [{ lat: 38.7, lon: -9.1 }, { lat: 38.8, lon: -9.2 }] };

beforeEach(() => {
	PATTERN = { _id: 'pattern', is_locked: false, line_id: 'line', route_id: 'route' };
	LINE = { _id: 'line', agency_id: 'A', is_locked: false };
	ROUTE = { _id: 'route', is_locked: false, line_id: 'line' };
	MISSING = false;
	CALLS = 0;
	globalThis.fetch = async () => {
		CALLS++;
		return new Response(JSON.stringify({ trip: { legs: [{ shape: encodePolylineFromGeoJson({ coordinates: [[-9.1, 38.7], [-9.2, 38.8]], type: 'LineString' }, 6), summary: { length: 1, time: 60 } }] } }), { status: 200 });
	};
});
afterEach(() => {
	globalThis.fetch = originalFetch;
});

async function invoke(data: unknown = body, action = 'update', agencies = ['A']) {
	let status = 200;
	let response: unknown;
	const rawRequest = new EventEmitter();
	const rawReply = new EventEmitter();
	CLOSE_CLIENT = () => {
		rawReply.emit('close');
	};
	const reply = {
		header: () => reply,
		raw: rawReply,
		send: (data: unknown) => {
			response = data;
			return reply;
		},
		status: (code: number) => {
			status = code;
			return reply;
		},
	};
	const request = { body: data, permissions: [{ action, resources: { agency_ids: agencies }, scope: 'lines' }], raw: rawRequest };
	await routePreviewHandler(request as unknown as Parameters<typeof routePreviewHandler>[0], reply as unknown as Parameters<typeof routePreviewHandler>[1]);
	return { rawReply, rawRequest, response: response as { data: { distance: number }, error: null | string, status_code: string }, status };
}

test('route previews return the common response envelope and remove disconnect listeners', async () => {
	const result = await invoke();
	assert.equal(result.status, 200);
	assert.equal(result.response.status_code, '200');
	assert.equal(result.response.data.distance, 1000);
	assert.equal(result.response.error, null);
	assert.equal(CALLS, 1);
	assert.equal(result.rawRequest.listenerCount('aborted'), 0);
	assert.equal(result.rawReply.listenerCount('close'), 0);
});

test('invalid coordinates, missing Pattern identity and incomplete routes are rejected before routing', async () => {
	for (const data of [{ points: body.points }, { ...body, points: [body.points[0]] }, { ...body, points: [{ lat: 91, lon: 0 }, body.points[1]] }, { ...body, points: [{ lat: 0, lon: Infinity }, body.points[1]] }]) {
		assert.equal((await invoke(data)).status, 400);
	}
	assert.equal(CALLS, 0);
});

test('read-only or foreign-operator permissions cannot calculate shapes', async () => {
	assert.equal((await invoke(body, 'read')).status, 403);
	assert.equal((await invoke(body, 'update', ['B'])).status, 403);
	assert.equal(CALLS, 0);
});

test('own and inherited locks block routing, including inconsistent parents and missing records', async () => {
	for (const record of [PATTERN, LINE, ROUTE]) {
		record.is_locked = true;
		assert.equal((await invoke()).status, 409);
		record.is_locked = false;
	}
	ROUTE.line_id = 'other';
	assert.equal((await invoke()).status, 409);
	MISSING = true;
	assert.equal((await invoke()).status, 404);
	assert.equal(CALLS, 0);
});

test('routing failures use a 502 error envelope and remove disconnect listeners', async () => {
	globalThis.fetch = async () => {
		throw new Error('Unavailable routing service');
	};
	const result = await invoke();
	assert.equal(result.status, 502);
	assert.equal(result.response.status_code, '502');
	assert.equal(result.rawReply.listenerCount('close'), 0);
});

test('disconnects abort upstream work without leaking listeners', async () => {
	let upstreamSignal: AbortSignal | undefined;
	globalThis.fetch = async (_url, options) => {
		upstreamSignal = options?.signal ?? undefined;
		CLOSE_CLIENT();
		throw new Error('aborted');
	};
	const result = await invoke();
	assert.equal(upstreamSignal?.aborted, true);
	assert.equal(result.rawRequest.listenerCount('aborted'), 0);
	assert.equal(result.rawReply.listenerCount('close'), 0);
});
