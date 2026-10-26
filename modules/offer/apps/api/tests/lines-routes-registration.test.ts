import { API_ROUTES, getModuleConfig } from '@tmlmobilidade/consts';
import { LineSchema, PatternSchema, RouteSchema } from '@tmlmobilidade/go-types-offer';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { after, beforeEach, mock, test } from 'node:test';

/* * */

let PERMISSIONS: Permission[];
let LINE_LOCKED: boolean;
let WRITES: string[];
const line = () => LineSchema.parse({ _id: 'line', agency_id: 'A', code: 'L1', created_at: 1_792_368_000_000, created_by: 'actor', is_locked: LINE_LOCKED, name: 'Line', updated_at: 1_792_368_000_000 });
const route = () => RouteSchema.parse({ _id: 'route', code: 'R1', created_at: 1_792_368_000_000, created_by: 'actor', line_id: 'line', name: 'Route', updated_at: 1_792_368_000_000 });

mock.module('@tmlmobilidade/go-providers-auth', {
	namedExports: {
		AUTH_SESSION_COOKIE_NAME: 'session_token',
		authProvider: {
			getOrganizationFromSessionToken: async () => ({ _id: 'organization' }),
			getPermissionsFromSessionToken: async () => PERMISSIONS,
			getUserFromSessionToken: async () => ({ _id: 'actor', first_name: 'Test', last_name: 'User' }),
		},
	},
});
mock.module('@tmlmobilidade/go-interfaces-godb', {
	namedExports: { goDb: { infrastructure: { stops: { findById: async (id: string) => id === '100001' ? { _id: id, name: 'Stop' } : null, findMany: async () => [{ _id: '100001', name: 'Stop', private_field: 'hidden' }] } }, offer: {
		fares: { findMany: async () => [] },
		lines: {
			findById: async () => line(),
			findMany: async () => [line()],
			insertOne: async (data: Record<string, unknown>) => {
				WRITES.push('line');
				return LineSchema.parse({ ...data, _id: 'new-line', created_at: 1_792_368_000_000, updated_at: 1_792_368_000_000 });
			},
		},
		patterns: {
			findById: async () => PatternSchema.parse({ _id: 'pattern', code: 'P1', created_at: 1_792_368_000_000, created_by: 'creator', destination: 'End', headsign: 'Headsign', line_id: 'line', origin: 'Start', path: [], route_id: 'route', updated_at: 1_792_368_000_000 }),
			findMany: async () => [],
			insertOne: async (data: Record<string, unknown>) => {
				WRITES.push('pattern');
				return PatternSchema.parse({ ...data, _id: 'new-pattern', created_at: 1_792_368_000_000, updated_at: 1_792_368_000_000 });
			},
			updateOne: async ({ _id }: { _id: string }, data: Record<string, unknown>) => {
				WRITES.push('pattern-update');
				return PatternSchema.parse({ _id, code: 'P1', created_at: 1_792_368_000_000, created_by: 'creator', destination: 'End', headsign: 'Headsign', line_id: 'line', origin: 'Start', route_id: 'route', updated_at: 1_792_368_000_000, ...data });
			},
		},
		routes: {
			findById: async () => route(),
			findMany: async () => [],
			insertOne: async (data: Record<string, unknown>) => {
				WRITES.push('route');
				return RouteSchema.parse({ ...data, _id: 'new-route', created_at: 1_792_368_000_000, updated_at: 1_792_368_000_000 });
			},
		},
		typologies: { findMany: async () => [] },
	} } },
});

const { FastifyService } = await import('@tmlmobilidade/go-clients-fastify');
const server = FastifyService.getInstance({ module: 'offer', origin: true }).server;
await import('../src/endpoints/lines/routes.js');
await import('../src/endpoints/routes/routes.js');
await import('../src/endpoints/patterns/routes.js');
await server.ready();
after(async () => {
	await server.close();
});
beforeEach(() => {
	PERMISSIONS = ['create', 'update', 'delete', 'lock', 'read'].map(action => ({ action, resources: { agency_ids: ['A'] }, scope: 'lines' } as Permission));
	LINE_LOCKED = false;
	WRITES = [];
});
const cookies = { session_token: 'test-session' };
const apiPath = (url: string) => url.replace(getModuleConfig('offer', 'api_url'), '');

/* * */

for (const [entity, url, payload] of [
	['line', API_ROUTES.offer.LINES_CREATE, { agency_id: 'A', code: 'L1', name: 'Line' }],
	['route', API_ROUTES.offer.ROUTES_CREATE, { code: 'R1', line_id: 'line', name: 'Route' }],
] as const) {
	test(`generated ${entity} create URL reaches authenticated validation and handler`, async () => {
		const response = await server.inject({ cookies, method: 'POST', payload: { ...payload, created_by: 'spoof' }, url: apiPath(url) });
		assert.equal(response.statusCode, 200);
		assert.equal(response.json().data.created_by, 'actor');
		assert.equal(response.json().data.updated_by, 'actor');
		assert.equal(response.json().status_code, '200');
		assert.deepEqual(WRITES, [entity]);
	});
	test(`${entity} create rejects missing scope permission before writes`, async () => {
		PERMISSIONS = [];
		const response = await server.inject({ cookies, method: 'POST', payload, url: apiPath(url) });
		assert.equal(response.statusCode, 403);
		assert.deepEqual(WRITES, []);
	});
	test(`${entity} create is absent at the old collection URL`, async () => {
		assert.equal((await server.inject({ cookies, method: 'POST', payload, url: `/${entity}s` })).statusCode, 404);
	});
}

for (const [method, url, payload] of [
	['POST', '/patterns/create', { code: 'P1', destination: 'End', headsign: 'Headsign', line_id: 'line', origin: 'Start', route_id: 'route' }],
	['PUT', '/patterns/pattern', {}],
	['GET', '/patterns/pattern/lock', undefined],
	['POST', '/patterns/pattern/import-gtfs', { path: [{ avg_speed: 0, dwell_time: 0, shape_dist_traveled: 0, stop_id: '123456', stop_sequence: 1 }], shape: [{ shape_dist_traveled: 0, shape_pt_lat: 38, shape_pt_lon: -9, shape_pt_sequence: 1 }, { shape_dist_traveled: 100, shape_pt_lat: 38.1, shape_pt_lon: -9, shape_pt_sequence: 2 }] }],
	['POST', '/patterns/pattern/comment', { message: 'Note' }],
	['DELETE', '/patterns/pattern', undefined],
] as const) {
	test(`${method} ${url} respects the Pattern parent-lock policy`, async () => {
		LINE_LOCKED = true;
		const response = await server.inject({ cookies, method, payload, url });
		assert.equal(response.statusCode, 409);
		assert.match(response.json().error, /parent line is locked/i);
		assert.deepEqual(WRITES, []);
	});
}

test('generated Pattern create URL validates the shared contract and server-owned audit fields', async () => {
	const response = await server.inject({ cookies, method: 'POST', payload: { code: 'P1', created_by: 'spoof', destination: 'End', headsign: 'Headsign', is_locked: true, line_id: 'line', origin: 'Start', route_id: 'route' }, url: apiPath(API_ROUTES.offer.PATTERNS_CREATE) });
	assert.equal(response.statusCode, 200);
	assert.equal(response.json().data.created_by, 'actor');
	assert.equal(response.json().data.updated_by, 'actor');
	assert.equal(response.json().data.is_locked, false);
	assert.equal(response.json().data.parameters.length, 1);
	assert.deepEqual(WRITES, ['pattern']);
	assert.equal((await server.inject({ cookies, method: 'POST', payload: {}, url: '/patterns' })).statusCode, 404);
});

test('Pattern comment route validates the message and ignores forged history metadata', async () => {
	const response = await server.inject({ cookies, method: 'POST', payload: { created_at: 1, created_by: 'spoof', message: ' Note ', type: 'crud' }, url: '/patterns/pattern/comment' });
	assert.equal(response.statusCode, 200);
	assert.equal(response.json().data.comments[0].created_by, 'Test User');
	assert.equal(response.json().data.comments[0].type, 'note');
	assert.equal(response.json().data.updated_by, 'actor');
	assert.equal((await server.inject({ cookies, method: 'POST', payload: { message: ' ' }, url: '/patterns/pattern/comment' })).statusCode, 400);
});

test('Pattern detail denies another operator even when the read scope is present', async () => {
	PERMISSIONS = [{ action: 'read', resources: { agency_ids: ['B'] }, scope: 'lines' }];
	const response = await server.inject({ cookies, method: 'GET', url: '/patterns/pattern' });
	assert.equal(response.statusCode, 403);
	assert.deepEqual(WRITES, []);
});

test('Pattern stop lookups use validated inputs and return only selector fields for searches', async () => {
	const response = await server.inject({ cookies, method: 'GET', url: '/patterns/stops?query=Stop' });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json().data, [{ _id: '100001', name: 'Stop' }]);
	assert.equal((await server.inject({ cookies, method: 'GET', url: '/patterns/stops?query=x' })).statusCode, 400);
	assert.equal((await server.inject({ cookies, method: 'GET', url: '/patterns/stops/invalid' })).statusCode, 400);
	assert.equal((await server.inject({ cookies, method: 'GET', url: '/patterns/stops/100002' })).statusCode, 404);
	assert.equal((await server.inject({ cookies, method: 'GET', url: '/patterns/stops/100001' })).statusCode, 200);
});
