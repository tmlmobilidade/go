import assert from 'node:assert/strict';
import { after, mock, test } from 'node:test';

/* * */

let FOUND = true;
let UPDATES = 0;
const ACCEPTANCE = { _id: 'ride', comments: [], is_locked: false };

mock.module('@tmlmobilidade/go-providers-auth', {
	namedExports: { AUTH_SESSION_COOKIE_NAME: 'session_token', authProvider: {} },
});
mock.module('@tmlmobilidade/go-interfaces-godb', {
	namedExports: {
		goDb: {
			operation: {
				rideAcceptances: {
					findById: async () => FOUND ? ACCEPTANCE : null,
					findOne: async () => FOUND ? ACCEPTANCE : null,
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
	Object.assign(request, { me: { _id: 'actor' } });
});
server.post('/comments/:id', addComment);
server.post('/status/:id', changeStatus);
server.get('/acceptances/:id', getRideAcceptance);
server.post('/justifications/:id', justifyRide);
server.post('/locks/:id', lockRideAcceptance);
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
