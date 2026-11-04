import { API_ROUTES, getModuleConfig } from '@tmlmobilidade/consts';
import { AnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { after, beforeEach, mock, test } from 'node:test';

/* * */

let PERMISSIONS: Permission[];
let WRITES: Record<string, unknown>[];
let AGENCIES: Record<string, unknown>[];

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
});

/* * */

const cookies = { session_token: 'test-session' };
const createPath = API_ROUTES.dates.ANNOTATIONS_CREATE.replace(getModuleConfig('dates', 'api_url'), '');

test('the generated annotation create URL reaches the authenticated handler', async () => {
	const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], created_by: 'spoof', title: 'Annotation' }, url: createPath });
	assert.equal(response.statusCode, 200);
	assert.equal(response.json().status_code, '200');
	assert.equal(response.json().data.created_by, 'actor');
	assert.equal(response.json().data.updated_by, 'actor');
	assert.equal(WRITES.length, 1);
});

test('annotation creation rejects missing and empty operators before storage writes', async () => {
	for (const payload of [{ title: 'Annotation' }, { agency_ids: [], title: 'Annotation' }]) {
		const response = await server.inject({ cookies, method: 'POST', payload, url: createPath });
		assert.equal(response.statusCode, 400);
	}
	assert.deepEqual(WRITES, []);
});

test('annotation creation denies users without create permission', async () => {
	PERMISSIONS = [{ action: 'read', resources: { agency_ids: ['A'] }, scope: 'annotations' }];
	const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], title: 'Annotation' }, url: createPath });
	assert.equal(response.statusCode, 403);
	assert.deepEqual(WRITES, []);
});

test('creation is not registered at collection or list URLs', async () => {
	for (const url of ['/annotations', '/annotations/list']) {
		const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], title: 'Annotation' }, url });
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
