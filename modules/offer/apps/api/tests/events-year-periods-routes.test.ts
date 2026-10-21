import { EventSchema } from '@tmlmobilidade/go-types-offer';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { after, beforeEach, mock, test } from 'node:test';

/* * */

let PERMISSIONS: Permission[];
let WRITES: Record<string, unknown>[];

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
			offer: {
				events: {
					insertOne: async (data: Record<string, unknown>) => {
						WRITES.push(data);
						return EventSchema.parse({ ...data, _id: 'event', created_at: 1_792_368_000_000, updated_at: 1_792_368_000_000 });
					},
				},
				yearPeriods: { findMany: async () => [] },
			},
		},
	},
});

// Exercise real Fastify route registration, authorization middleware, handlers and HTTP serialization.
const { FastifyService } = await import('@tmlmobilidade/go-clients-fastify');
const server = FastifyService.getInstance({ module: 'offer', origin: true }).server;
await import('../src/endpoints/events/routes.js');
await import('../src/endpoints/year-periods/routes.js');
await server.ready();
after(async () => {
	await server.close();
});
beforeEach(() => {
	PERMISSIONS = [];
	WRITES = [];
});

const cookies = { session_token: 'test-session' };

test('Offer event creation authenticates, validates and serializes a standard response', async () => {
	PERMISSIONS = [{ action: 'create', resources: { agency_ids: ['A'] }, scope: 'events' }];
	const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], code: 'EVENT', created_by: 'spoof', title: 'Event' }, url: '/events' });
	assert.equal(response.statusCode, 200);
	const payload = response.json();
	assert.equal(payload.status_code, '200');
	assert.equal(payload.data.created_by, 'actor');
	assert.equal(payload.data.updated_by, 'actor');
	assert.equal(typeof payload.timestamp, 'number');
	assert.equal('associated_patterns' in payload.data, false);
	assert.equal(WRITES.length, 1);
});

test('Offer routes reject users lacking the required scope before storage access', async () => {
	PERMISSIONS = [{ action: 'read', resources: { agency_ids: ['A'] }, scope: 'events' }];
	const response = await server.inject({ cookies, method: 'GET', url: '/year-periods' });
	assert.equal(response.statusCode, 403);
	assert.equal(response.json().status_code, '403');
	assert.deepEqual(WRITES, []);
});

test('Offer custom conflict route validates JSON and returns the conflict contract', async () => {
	PERMISSIONS = [{ action: 'read', resources: { agency_ids: ['A'] }, scope: 'year_periods' }];
	const invalid = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], dates: 'invalid' }, url: '/year-periods/check-conflicts' });
	assert.equal(invalid.statusCode, 400);
	const response = await server.inject({ cookies, method: 'POST', payload: { agency_ids: ['A'], dates: ['20261020'] }, url: '/year-periods/check-conflicts' });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json().data, { conflicts: [] });
});
