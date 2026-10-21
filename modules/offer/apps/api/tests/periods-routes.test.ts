import { API_ROUTES, getModuleConfig } from '@tmlmobilidade/consts';
import { YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
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
			core: {
				agencies: {
					findMany: async () => AGENCIES,
				},
			},
			offer: {
				yearPeriods: {
					insertOne: async (data: Record<string, unknown>) => {
						WRITES.push(data);
						return YearPeriodSchema.parse({ ...data, _id: 'period', created_at: 1_792_368_000_000, updated_at: 1_792_368_000_000 });
					},
				},
			},
		},
	},
});

/* * */

// Exercise real routes, middleware, validation and serialization with mocked storage/session lookups.
const { FastifyService } = await import('@tmlmobilidade/go-clients-fastify');
const server = FastifyService.getInstance({ module: 'offer', origin: true }).server;
await import('../src/endpoints/year-periods/routes.js');
await server.ready();

after(async () => {
	await server.close();
});

beforeEach(() => {
	PERMISSIONS = [{ action: 'create', resources: { agency_ids: ['A'] }, scope: 'year_periods' }];
	WRITES = [];
	AGENCIES = [{ _id: 'A', code: '1', name: 'Carris', private_field: 'must not appear', short_name: 'CCFL' }];
});

/* * */

const cookies = { session_token: 'test-session' };
const createPath = API_ROUTES.offer.YEAR_PERIODS_CREATE.replace(getModuleConfig('offer', 'api_url'), '');

test('the generated period create URL reaches the authenticated handler', async () => {
	const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], code: 'EVENT', created_by: 'spoof', name: 'Period' }, url: createPath });
	assert.equal(response.statusCode, 200);
	assert.equal(response.json().status_code, '200');
	assert.equal(response.json().data.created_by, 'actor');
	assert.equal(response.json().data.updated_by, 'actor');
	assert.equal(WRITES.length, 1);
});

test('period creation rejects missing and empty operators before storage writes', async () => {
	for (const payload of [{ code: 'EVENT', name: 'Period' }, { agency_ids: [], code: 'EVENT', name: 'Period' }]) {
		const response = await server.inject({ cookies, method: 'POST', payload, url: createPath });
		assert.equal(response.statusCode, 400);
	}
	assert.deepEqual(WRITES, []);
});

test('period creation denies users without create permission', async () => {
	PERMISSIONS = [{ action: 'read', resources: { agency_ids: ['A'] }, scope: 'year_periods' }];
	const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], code: 'EVENT', name: 'Period' }, url: createPath });
	assert.equal(response.statusCode, 403);
	assert.deepEqual(WRITES, []);
});

test('creation is not registered at collection or list URLs', async () => {
	for (const url of ['/year-periods', '/year-periods/list']) {
		const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], code: 'EVENT', name: 'Period' }, url });
		assert.equal(response.statusCode, 404);
	}
	assert.deepEqual(WRITES, []);
});

const agenciesPath = API_ROUTES.offer.YEAR_PERIODS_LIST_AGENCIES.replace(getModuleConfig('offer', 'api_url'), '');

test('period-only read, create and update permissions can load agency labels', async () => {
	for (const action of ['read', 'create', 'update'] as const) {
		PERMISSIONS = [{ action, resources: { agency_ids: ['A'] }, scope: 'year_periods' }];
		const response = await server.inject({ cookies, method: 'GET', url: agenciesPath });
		assert.equal(response.statusCode, 200);
		assert.deepEqual(response.json().data, [{ _id: 'A', code: '1', name: 'Carris' }]);
	}
});

test('annotations permissions alone do not authorize the year-periods agency lookup', async () => {
	PERMISSIONS = [{ action: 'read', resources: { agency_ids: ['A'] }, scope: 'annotations' }];
	const response = await server.inject({ cookies, method: 'GET', url: agenciesPath });
	assert.equal(response.statusCode, 403);
});

test('an empty agency lookup returns a successful empty list', async () => {
	AGENCIES = [];
	const response = await server.inject({ cookies, method: 'GET', url: agenciesPath });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json().data, []);
});
