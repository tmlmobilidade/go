import { API_ROUTES, getModuleConfig } from '@tmlmobilidade/consts';
import assert from 'node:assert/strict';
import { after, mock, test } from 'node:test';

/* * */

let AUTHENTICATED = true;
let AGENCIES: Record<string, unknown>[] = [{ _id: 'A', code: '1', financials: { private: true }, name: 'Agency A', short_name: 'A' }];
let PROJECTION: unknown;

mock.module('@tmlmobilidade/go-providers-auth', {
	namedExports: {
		AUTH_SESSION_COOKIE_NAME: 'session_token',
		authProvider: {
			getOrganizationFromSessionToken: async () => ({ _id: 'organization' }),
			getPermissionsFromSessionToken: async () => [],
			getUserFromSessionToken: async () => AUTHENTICATED ? { _id: 'actor' } : null,
		},
	},
});
mock.module('@tmlmobilidade/go-interfaces-godb', {
	namedExports: { goDb: { core: { agencies: { findMany: async (_filter: unknown, options: { projection: unknown }) => {
		PROJECTION = options.projection;
		return AGENCIES;
	} } } } },
});

const { FastifyService } = await import('@tmlmobilidade/go-clients-fastify');
const server = FastifyService.getInstance({ module: 'core', origin: true }).server;
await import('../src/endpoints/platform/agencies/routes.js');
await server.ready();
after(async () => { await server.close(); });

const path = API_ROUTES.core.AGENCIES_LOOKUP.replace(getModuleConfig('core', 'api_url'), '');

test('allows authenticated lookups without Agencies management access and strips private fields', async () => {
	const response = await server.inject({ cookies: { session_token: 'session' }, method: 'GET', url: path });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json().data, [{ _id: 'A', code: '1', name: 'Agency A', short_name: 'A' }]);
	assert.deepEqual(PROJECTION, { _id: 1, code: 1, name: 1, short_name: 1 });
});

test('returns an empty successful lookup when no agencies exist', async () => {
	AGENCIES = [];
	const response = await server.inject({ cookies: { session_token: 'session' }, method: 'GET', url: path });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json().data, []);
});

test('does not expose agency data without an authenticated session', async () => {
	AUTHENTICATED = false;
	const response = await server.inject({ method: 'GET', url: path });
	assert.equal(response.json().data, null);
	assert.ok(response.json().error);
});
