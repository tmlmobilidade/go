import { API_ROUTES, getModuleConfig } from '@tmlmobilidade/consts';
import { FareSchema, TypologySchema, ZoneSchema } from '@tmlmobilidade/go-types-offer';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { after, beforeEach, mock, test } from 'node:test';

/* * */

let PERMISSIONS: Permission[];
let WRITES: Record<string, unknown>[];
let AGENCIES: Record<string, unknown>[];
let FARES: Record<string, unknown>[];
let FARE_QUERY: unknown;

const resources = [
	{ agencyUrl: API_ROUTES.offer.TYPOLOGIES_LIST_AGENCIES, createUrl: API_ROUTES.offer.TYPOLOGIES_CREATE, name: 'typologies', schema: TypologySchema },
	{ agencyUrl: API_ROUTES.offer.ZONES_LIST_AGENCIES, createUrl: API_ROUTES.offer.ZONES_CREATE, name: 'zones', schema: ZoneSchema },
	{ agencyUrl: API_ROUTES.offer.FARES_LIST_AGENCIES, createUrl: API_ROUTES.offer.FARES_CREATE, name: 'fares', schema: FareSchema },
] as const;

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
			offer: Object.fromEntries(resources.map(resource => [resource.name, {
				findMany: async (query: unknown) => {
					FARE_QUERY = query;
					return FARES;
				},
				insertOne: async (data: Record<string, unknown>) => {
					WRITES.push(data);
					return resource.schema.parse({ ...data, _id: 'record', created_at: 1_792_368_000_000, updated_at: 1_792_368_000_000 });
				},
			}])),
		},
	},
});

/* * */

// Exercise actual routes and middleware; mock only external session and storage lookups.
const { FastifyService } = await import('@tmlmobilidade/go-clients-fastify');
const server = FastifyService.getInstance({ module: 'offer', origin: true }).server;
await import('../src/endpoints/typologies/routes.js');
await import('../src/endpoints/zones/routes.js');
await import('../src/endpoints/fares/routes.js');
await server.ready();

after(async () => {
	await server.close();
});
beforeEach(() => {
	PERMISSIONS = [];
	WRITES = [];
	AGENCIES = [{ _id: 'A', code: '1', name: 'Carris', private_field: 'omit', short_name: 'CCFL' }];
	FARES = [{ _id: 'fare', agency_ids: ['A'], name: 'Fare', payment_method: '0', price: 1, private_field: 'omit' }];
	FARE_QUERY = undefined;
});

const cookies = { session_token: 'test-session' };
const relative = (url: string) => url.replace(getModuleConfig('offer', 'api_url'), '');

/* * */

for (const resource of resources) {
	test(`${resource.name}: generated create route validates input and sets server audits`, async () => {
		PERMISSIONS = [{ action: 'create', resources: { agency_ids: ['A'] }, scope: resource.name }];
		const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], code: 'CODE', created_by: 'spoof', name: 'Name' }, url: relative(resource.createUrl) });
		assert.equal(response.statusCode, 200);
		assert.equal(response.json().data.created_by, 'actor');
		assert.equal(response.json().data.updated_by, 'actor');
		assert.equal(WRITES.length, 1);
	});

	test(`${resource.name}: missing/empty operators and unauthorized creates never write`, async () => {
		PERMISSIONS = [{ action: 'create', resources: { agency_ids: ['A'] }, scope: resource.name }];
		for (const agencyIds of [undefined, []]) {
			const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: agencyIds, code: 'CODE', name: 'Name' }, url: relative(resource.createUrl) });
			assert.equal(response.statusCode, 400);
		}
		PERMISSIONS = [{ action: 'nav', resources: { agency_ids: ['A'] }, scope: resource.name }];
		const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], code: 'CODE', name: 'Name' }, url: relative(resource.createUrl) });
		assert.equal(response.statusCode, 403);
		assert.deepEqual(WRITES, []);
	});

	test(`${resource.name}: creation is not registered at the collection URL`, async () => {
		PERMISSIONS = [{ action: 'create', resources: { agency_ids: ['A'] }, scope: resource.name }];
		const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], code: 'CODE', name: 'Name' }, url: `/${resource.name}` });
		assert.equal(response.statusCode, 404);
		assert.deepEqual(WRITES, []);
	});

	test(`${resource.name}: feature-only permissions load picked agency labels and empty lists`, async () => {
		for (const action of ['nav', 'create', 'update'] as const) {
			PERMISSIONS = [{ action, resources: { agency_ids: ['A'] }, scope: resource.name }];
			const response = await server.inject({ cookies, method: 'GET', url: relative(resource.agencyUrl) });
			assert.equal(response.statusCode, 200);
			assert.deepEqual(response.json().data, [{ _id: 'A', code: '1', name: 'Carris', short_name: 'CCFL' }]);
		}
		AGENCIES = [];
		const empty = await server.inject({ cookies, method: 'GET', url: relative(resource.agencyUrl) });
		assert.equal(empty.statusCode, 200);
		assert.deepEqual(empty.json().data, []);
	});

	test(`${resource.name}: agency labels default missing short names`, async () => {
		PERMISSIONS = [{ action: 'nav', resources: { agency_ids: ['A'] }, scope: resource.name }];
		AGENCIES = [{ _id: 'A', code: '1', name: 'Carris' }];
		const response = await server.inject({ cookies, method: 'GET', url: relative(resource.agencyUrl) });
		assert.equal(response.statusCode, 200);
		assert.deepEqual(response.json().data, [{ _id: 'A', code: '1', name: 'Carris', short_name: '' }]);
	});

	test(`${resource.name}: unrelated permissions do not grant agency lookup access`, async () => {
		PERMISSIONS = [{ action: 'read', resources: { agency_ids: ['A'] }, scope: 'annotations' }];
		const response = await server.inject({ cookies, method: 'GET', url: relative(resource.agencyUrl) });
		assert.equal(response.statusCode, 403);
	});
}

test('typology fare options work without Fares management permission and query accessible operators only', async () => {
	for (const action of ['nav', 'update'] as const) {
		PERMISSIONS = [{ action, resources: { agency_ids: ['A'] }, scope: 'typologies' }];
		const response = await server.inject({ cookies, method: 'GET', url: relative(API_ROUTES.offer.TYPOLOGIES_LIST_FARES) });
		assert.equal(response.statusCode, 200);
		assert.deepEqual(FARE_QUERY, { agency_ids: { $in: ['A'] } });
		assert.deepEqual(response.json().data, [{ _id: 'fare', name: 'Fare', payment_method: '0' }]);
	}
});

test('global typology access supports all fares and an empty lookup', async () => {
	PERMISSIONS = [{ action: 'nav', resources: { agency_ids: [PermissionCatalog.ALLOW_ALL_FLAG] }, scope: 'typologies' }];
	FARES = [];
	const response = await server.inject({ cookies, method: 'GET', url: relative(API_ROUTES.offer.TYPOLOGIES_LIST_FARES) });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(FARE_QUERY, {});
	assert.deepEqual(response.json().data, []);
});

test('Fares permissions alone do not grant the typology fare lookup', async () => {
	PERMISSIONS = [{ action: 'nav', resources: { agency_ids: ['A'] }, scope: 'fares' }];
	const response = await server.inject({ cookies, method: 'GET', url: relative(API_ROUTES.offer.TYPOLOGIES_LIST_FARES) });
	assert.equal(response.statusCode, 403);
	assert.equal(FARE_QUERY, undefined);
});
