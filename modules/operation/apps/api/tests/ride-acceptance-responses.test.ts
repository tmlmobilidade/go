import { type RideAcceptanceStatus } from '@tmlmobilidade/go-types-operation';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { after, mock, test } from 'node:test';

/* * */

let FOUND = true;
let UPDATES = 0;
let REOPEN_CONFLICT = false;
let PERMISSIONS: Permission[] = [];
const CHANGE_STATUS_PERMISSION: Permission = { action: 'acceptance_change_status', resources: { agency_ids: [] }, scope: 'rides' };
const JUSTIFY_PERMISSION: Permission = { action: 'acceptance_justify', resources: { agency_ids: [] }, scope: 'rides' };
const ACCEPTANCE = { _id: 'ride', acceptance_status: 'under_review' as RideAcceptanceStatus, comments: [], is_locked: false };

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
			operation: {
				rideAcceptances: {
					findById: async () => FOUND ? ACCEPTANCE : null,
					findOne: async () => FOUND ? ACCEPTANCE : null,
					getCollection: async () => ({
						findOneAndUpdate: async (filter: { _id: string, acceptance_status: RideAcceptanceStatus }, update: { $set: { acceptance_status: RideAcceptanceStatus, updated_at: number, updated_by: string } }, options: { returnDocument: string }) => {
							assert.deepEqual(filter, { _id: 'ride', acceptance_status: 'under_review' });
							assert.deepEqual(options, { returnDocument: 'after' });
							assert.equal(update.$set.updated_by, 'actor');
							assert.equal(typeof update.$set.updated_at, 'number');
							if (REOPEN_CONFLICT || ACCEPTANCE.acceptance_status !== filter.acceptance_status) return null;
							UPDATES++;
							Object.assign(ACCEPTANCE, update.$set);
							return ACCEPTANCE;
						},
					}),
					updateById: async (_id: string, data: Record<string, unknown>) => {
						UPDATES++;
						return data;
					},
				},
			},
		},
	},
});

const { FastifyService } = await import('@tmlmobilidade/go-clients-fastify');
const { addComment } = await import('../src/endpoints/ride-acceptances/handlers/add-comment.js');
const { changeStatus } = await import('../src/endpoints/ride-acceptances/handlers/change-status.js');
const { getRideAcceptance } = await import('../src/endpoints/ride-acceptances/handlers/get-ride-acceptance.js');
const { justifyRide } = await import('../src/endpoints/ride-acceptances/handlers/justify-ride.js');
const { lockRideAcceptance } = await import('../src/endpoints/ride-acceptances/handlers/lock-ride-acceptance.js');

const server = FastifyService.getInstance({ module: 'operation', origin: true }).server;
server.addHook('preHandler', async (request) => {
	Object.assign(request, { me: { _id: 'actor' }, permissions: [CHANGE_STATUS_PERMISSION] });
});
server.post('/comments/:id', addComment);
server.post('/status/:id', changeStatus);
server.get('/acceptances/:id', getRideAcceptance);
server.post('/justifications/:id', justifyRide);
server.post('/locks/:id', lockRideAcceptance);
await import('../src/endpoints/ride-acceptances/routes.js');
await server.ready();
after(async () => { await server.close(); });

const requests = [
	{ method: 'POST', payload: { message: 'Comment' }, url: '/comments/ride' },
	{ method: 'POST', payload: { acceptance_status: 'under_review' }, url: '/status/ride' },
	{ method: 'GET', url: '/acceptances/ride' },
	{ method: 'POST', payload: { justification_cause: 'other', pto_message: 'Justification' }, url: '/justifications/ride' },
	{ method: 'POST', payload: { is_locked: true }, url: '/locks/ride' },
	{ method: 'POST', payload: { is_locked: false }, url: '/locks/ride' },
] as const;

test('ride acceptance handlers return standard success and error envelopes', async () => {
	for (const request of requests) {
		FOUND = true;
		const success = await server.inject(request);
		assert.equal(success.statusCode, 200, request.url);
		assert.equal(success.json().status_code, '200');
		assert.equal(success.json().error, null);
		assert.equal(typeof success.json().timestamp, 'number');
		assert.equal(success.headers['go-upstream-timestamp'], String(success.json().timestamp));
		assert.equal(success.json().statusCode, undefined);

		const updateCount = UPDATES;
		FOUND = false;
		const missing = await server.inject(request);
		assert.equal(missing.statusCode, 404, request.url);
		assert.equal(missing.json().status_code, '404');
		assert.equal(missing.json().data, null);
		assert.match(missing.json().error, /not found/i);
		assert.equal(typeof missing.json().timestamp, 'number');
		assert.equal(UPDATES, updateCount);
	}
});

test('change status limits users with justification permission to reopening pending reviews', async () => {
	FOUND = true;
	const changeRideStatus = (status: RideAcceptanceStatus) => server.inject({
		cookies: { session_token: 'test-session' },
		method: 'PUT',
		payload: { acceptance_status: status },
		url: '/ride-acceptances/ride/change-status',
	});

	ACCEPTANCE.acceptance_status = 'under_review';
	PERMISSIONS = [JUSTIFY_PERMISSION];
	const reopened = await changeRideStatus('justification_required');
	assert.equal(reopened.statusCode, 200);
	assert.equal(reopened.json().data.acceptance_status, 'justification_required');

	const updateCount = UPDATES;
	ACCEPTANCE.acceptance_status = 'under_review';
	assert.equal((await changeRideStatus('accepted')).statusCode, 403);
	REOPEN_CONFLICT = true;
	assert.equal((await changeRideStatus('justification_required')).statusCode, 409);
	REOPEN_CONFLICT = false;
	ACCEPTANCE.acceptance_status = 'accepted';
	assert.equal((await changeRideStatus('justification_required')).statusCode, 403);
	PERMISSIONS = [];
	ACCEPTANCE.acceptance_status = 'under_review';
	assert.equal((await changeRideStatus('justification_required')).statusCode, 403);
	assert.equal(UPDATES, updateCount);

	PERMISSIONS = [CHANGE_STATUS_PERMISSION];
	const reviewed = await changeRideStatus('rejected');
	assert.equal(reviewed.statusCode, 200);
	assert.equal(reviewed.json().data.acceptance_status, 'rejected');
});
