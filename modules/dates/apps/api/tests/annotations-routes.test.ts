import { API_ROUTES, getModuleConfig } from '@tmlmobilidade/consts';
import { AnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { type LocationTreeNode } from '@tmlmobilidade/go-types-locations';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { after, beforeEach, mock, test } from 'node:test';

/* * */

let PERMISSIONS: Permission[];
let WRITES: Record<string, unknown>[];
let AGENCIES: Record<string, unknown>[];
let AFFECTED_AGENCY_IDS: string[];
let LOCATION_TREE: LocationTreeNode[];

mock.module('@tmlmobilidade/go-providers-locations', {
	namedExports: { locationsProvider: { findAdministrativeTree: async () => LOCATION_TREE } },
});

mock.module('@tmlmobilidade/go-providers-auth', {
	namedExports: {
		AUTH_SESSION_COOKIE_NAME: 'session_token',
		authProvider: {
			getOrganizationFromSessionToken: async () => ({ _id: 'organization' }),
			getPermissionsFromSessionToken: async () => PERMISSIONS,
			getUserFromSessionToken: async () => ({ _id: 'actor' }),
		},
	},
});

mock.module('@tmlmobilidade/go-interfaces-godb', {
	namedExports: {
		goDb: {
			core: { agencies: { findMany: async () => AGENCIES } },
			dates: {
				annotations: {
					findById: async () => AnnotationSchema.parse({ _id: 'annotation', agency_ids: AFFECTED_AGENCY_IDS, created_at: 1_792_368_000_000, created_by: 'actor', dates: [20261113], title: 'Annotation', updated_at: 1_792_368_000_000 }),
					insertOne: async (data: Record<string, unknown>) => {
						WRITES.push(data);
						return AnnotationSchema.parse({ ...data, _id: 'annotation', created_at: 1_792_368_000_000, updated_at: 1_792_368_000_000 });
					},
				},
			},
		},
	},
});

/* * */

// Exercise real routes, middleware, validation and serialization with mocked storage/session lookups.
const { FastifyService } = await import('@tmlmobilidade/go-clients-fastify');
const server = FastifyService.getInstance({ module: 'dates', origin: true }).server;
await import('../src/endpoints/annotations/routes.js');
await server.ready();

after(async () => {
	await server.close();
});

beforeEach(() => {
	PERMISSIONS = [{ action: 'create', resources: { agency_ids: ['A'] }, scope: 'annotations' }];
	WRITES = [];
	AGENCIES = [{ _id: 'A', code: '1', name: 'Carris', private_field: 'omit', short_name: 'CCFL' }];
	AFFECTED_AGENCY_IDS = [];
	LOCATION_TREE = [{ admin_level: '2', children: [{ admin_level: '7', children: [], code: '1503', id: '2', name: 'Almada' }], code: null, id: '1', name: 'Portugal' }];
});

/* * */

const cookies = { session_token: 'test-session' };
const createPath = API_ROUTES.dates.ANNOTATIONS_CREATE.replace(getModuleConfig('dates', 'api_url'), '');

test('the generated annotation create URL reaches the authenticated handler', async () => {
	const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], created_by: 'spoof', dates: [20261113], title: 'Annotation' }, url: createPath });
	assert.equal(response.statusCode, 200);
	assert.equal(response.json().status_code, '200');
	assert.equal(response.json().data.created_by, 'actor');
	assert.equal(response.json().data.updated_by, 'actor');
	assert.equal(WRITES.length, 1);
});

test('annotation creation accepts missing and empty affected operators', async () => {
	for (const payload of [{ dates: [20261113], title: 'Annotation' }, { agency_ids: [], dates: [20261113], title: 'Annotation' }]) {
		const response = await server.inject({ cookies, method: 'POST', payload, url: createPath });
		assert.equal(response.statusCode, 200);
		assert.deepEqual(response.json().data.agency_ids, []);
	}
	assert.equal(WRITES.length, 2);
});

test('annotation creation denies users without create permission', async () => {
	PERMISSIONS = [{ action: 'read', resources: { agency_ids: ['A'] }, scope: 'annotations' }];
	const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], dates: [20261113], title: 'Annotation' }, url: createPath });
	assert.equal(response.statusCode, 403);
	assert.deepEqual(WRITES, []);
});

test('unassigned annotations are readable without annotation permissions but still require authentication', async () => {
	PERMISSIONS = [];
	const response = await server.inject({ cookies, method: 'GET', url: '/annotations/annotation' });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json().data.agency_ids, []);
	assert.equal((await server.inject({ method: 'GET', url: '/annotations/annotation' })).statusCode, 401);
	assert.equal((await server.inject({ cookies, method: 'GET', url: '/annotations/list-agencies' })).statusCode, 200);
});

test('assigned annotation reads require access to every affected operator', async () => {
	AFFECTED_AGENCY_IDS = ['A', 'B'];
	for (const agencyIds of [[], ['A'], ['B']]) {
		PERMISSIONS = [{ action: 'read', resources: { agency_ids: agencyIds }, scope: 'annotations' }];
		assert.equal((await server.inject({ cookies, method: 'GET', url: '/annotations/annotation' })).statusCode, 403);
	}
	PERMISSIONS = [{ action: 'read', resources: { agency_ids: ['A', 'B'] }, scope: 'annotations' }];
	assert.equal((await server.inject({ cookies, method: 'GET', url: '/annotations/annotation' })).statusCode, 200);
});

test('creation is not registered at collection or list URLs', async () => {
	for (const url of ['/annotations', '/annotations/list']) {
		const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], dates: [20261113], title: 'Annotation' }, url });
		assert.equal(response.statusCode, 404);
	}
	assert.deepEqual(WRITES, []);
});

const agenciesPath = API_ROUTES.dates.ANNOTATIONS_LIST_AGENCIES.replace(getModuleConfig('dates', 'api_url'), '');

test('annotation feature permissions can load picked agency labels including short names', async () => {
	for (const action of ['read', 'create'] as const) {
		PERMISSIONS = [{ action, resources: { agency_ids: ['A'] }, scope: 'annotations' }];
		const response = await server.inject({ cookies, method: 'GET', url: agenciesPath });
		assert.equal(response.statusCode, 200);
		assert.deepEqual(response.json().data, [{ _id: 'A', code: '1', name: 'Carris', short_name: 'CCFL' }]);
	}
});

test('annotation labels tolerate agencies without short names', async () => {
	AGENCIES = [{ _id: 'A', code: '1', name: 'Carris' }];
	const response = await server.inject({ cookies, method: 'GET', url: agenciesPath });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json().data, [{ _id: 'A', code: '1', name: 'Carris', short_name: '' }]);
});

const locationsPath = API_ROUTES.dates.ANNOTATIONS_LIST_LOCATIONS.replace(getModuleConfig('dates', 'api_url'), '');

test('annotation locations expose the authoritative hierarchy to authenticated users', async () => {
	PERMISSIONS = [];
	const response = await server.inject({ cookies, method: 'GET', url: locationsPath });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json().data, LOCATION_TREE);
	assert.equal((await server.inject({ method: 'GET', url: locationsPath })).statusCode, 401);
});

test('creation resolves and deduplicates location IDs using canonical reference data', async () => {
	const location = { admin_level: 'incorrect', code: 'incorrect', name: 'Incorrect name', osm_id: 1 };
	const response = await server.inject({ cookies, method: 'POST', payload: { dates: [20261113], locations: [location, location], title: 'National event' }, url: createPath });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(WRITES[0].locations, [{ admin_level: '2', code: null, name: 'Portugal', osm_id: 1 }]);
});

test('creation rejects unknown geographic IDs without writing the annotation', async () => {
	const response = await server.inject({ cookies, method: 'POST', payload: { dates: [20261113], locations: [{ admin_level: '7', name: 'Unknown place', osm_id: 999 }], title: 'Event' }, url: createPath });
	assert.equal(response.statusCode, 400);
	assert.deepEqual(WRITES, []);
});

test('annotation creation requires at least one occurrence date', async () => {
	for (const payload of [{ title: 'Event' }, { dates: [], title: 'Event' }, { dates: null, title: 'Event' }]) {
		const response = await server.inject({ cookies, method: 'POST', payload, url: createPath });
		assert.equal(response.statusCode, 400);
	}
	assert.deepEqual(WRITES, []);
});

test('annotation sources retain names and URLs with localized validation', async () => {
	const sources = [{ name: 'Article title', url: 'https://example.com/article' }, { name: 'Email: operator notice', url: null }, { name: '', url: 'https://example.com/notice' }];
	const response = await server.inject({ cookies, method: 'POST', payload: { dates: [20261113], sources, title: 'Event' }, url: createPath });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(WRITES[0].sources, sources);
	for (const source of [{ name: '', url: null }, { name: 'Unsafe URL', url: 'javascript:alert(1)' }, { name: 'Invalid URL', url: 'not-a-url' }]) {
		const invalid = await server.inject({ cookies, headers: { 'accept-language': 'en' }, method: 'POST', payload: { dates: [20261113], sources: [source], title: 'Event' }, url: createPath });
		assert.equal(invalid.statusCode, 400);
		assert.ok(invalid.json().issues.some(issue => issue.path[0] === 'sources'));
	}
	assert.equal(WRITES.length, 1);
});
