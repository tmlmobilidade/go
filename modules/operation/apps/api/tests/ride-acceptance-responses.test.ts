import { type RideAcceptanceStatus, RideJustificationSchema } from '@tmlmobilidade/go-types-operation';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import { type Comment } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { after, mock, test } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

/* * */

let FOUND = true;
let UPDATES = 0;
let REOPEN_CONFLICT = false;
let beforeWrite: (() => void) | undefined;
let PERMISSIONS: Permission[] = [];
const CHANGE_STATUS_PERMISSION: Permission = { action: 'acceptance_change_status', resources: { agency_ids: [] }, scope: 'rides' };
const JUSTIFY_PERMISSION: Permission = { action: 'acceptance_justify', resources: { agency_ids: [] }, scope: 'rides' };
const ACCEPTANCE = { _id: 'ride', acceptance_status: 'under_review' as RideAcceptanceStatus, comments: [] as Comment[], is_locked: false, justification: RideJustificationSchema.nullable().parse(null) };

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
					findById: async () => FOUND ? structuredClone(ACCEPTANCE) : null,
					findOne: async () => FOUND ? ACCEPTANCE : null,
					getCollection: async () => ({
						findOneAndUpdate: async (filter: Record<string, unknown>, update: { $push: { comments: Comment | { $each: Comment[] } }, $set: Record<string, unknown> }, options: { returnDocument: string }) => {
							const pendingWrite = beforeWrite;
							beforeWrite = undefined;
							pendingWrite?.();
							assert.equal(filter._id, 'ride');
							assert.deepEqual(options, { returnDocument: 'after' });
							assert.equal(update.$set.updated_by, 'actor');
							assert.equal(typeof update.$set.updated_at, 'number');
							assert.equal(Object.hasOwn(update.$set, 'comments'), false);
							const events = '$each' in update.$push.comments ? update.$push.comments.$each : [update.$push.comments];
							for (const event of events) {
								if (event.type === 'field_changed' && event.field === 'acceptance_status') {
									assert.equal(filter.acceptance_status, event.prev_value);
								}
							}
							if (!FOUND || REOPEN_CONFLICT) return null;
							for (const [key, expected] of Object.entries(filter)) {
								const actual = ACCEPTANCE[key as keyof typeof ACCEPTANCE];
								if (expected && typeof expected === 'object' && '$ne' in expected) {
									if (isDeepStrictEqual(actual, expected.$ne)) return null;
								} else if (!isDeepStrictEqual(actual ?? null, expected)) {
									return null;
								}
							}
							UPDATES++;
							Object.assign(ACCEPTANCE, update.$set);
							ACCEPTANCE.comments.push(...events);
							return ACCEPTANCE;
						},
					}),
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
	{ method: 'POST', payload: { field: 'justification', message: 'Comment', type: 'field_changed' }, url: '/comments/ride' },
	{ method: 'POST', payload: { acceptance_status: 'under_review' }, url: '/status/ride' },
	{ method: 'GET', url: '/acceptances/ride' },
	{ method: 'POST', payload: { justification_cause: 'WEATHER', pto_message: 'Justification' }, url: '/justifications/ride' },
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
		if (request.url === '/comments/ride') {
			assert.equal(success.json().data.comments.at(-1).type, 'note');
		}
		if (request.url === '/justifications/ride') {
			const event = success.json().data.comments.at(-1);
			assert.equal(event.field, 'justification');
			assert.equal(event.curr_value.justification_source, 'manual');
		}

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
	const reopenedEvent = reopened.json().data.comments.at(-1);
	assert.equal(reopenedEvent.field, 'acceptance_status');
	assert.equal(reopenedEvent.prev_value, 'under_review');
	assert.equal(reopenedEvent.curr_value, 'justification_required');
	assert.equal(reopenedEvent.created_by, 'actor');

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
	ACCEPTANCE.acceptance_status = 'accepted';
	const requested = await changeRideStatus('justification_required');
	assert.equal(requested.statusCode, 200);
	assert.equal(requested.json().data.comments.at(-1).prev_value, 'accepted');

	const reviewed = await changeRideStatus('rejected');
	assert.equal(reviewed.statusCode, 200);
	assert.equal(reviewed.json().data.acceptance_status, 'rejected');
});

test('locking preserves a comment added after the acceptance was read', async () => {
	FOUND = true;
	ACCEPTANCE.is_locked = false;
	ACCEPTANCE.comments = [];
	const savedJustification = JSON.parse(JSON.stringify(ACCEPTANCE.justification));
	const now = 1_800_000_000_000 as Comment['created_at'];
	const note = { created_at: now, created_by: 'operator', message: 'Existing history', type: 'note', updated_at: now } as const;
	beforeWrite = () => ACCEPTANCE.comments.push(note);

	const response = await server.inject({ method: 'POST', payload: { is_locked: true }, url: '/locks/ride' });
	assert.equal(response.statusCode, 200);
	assert.deepEqual(response.json().data.comments[0], note);
	assert.equal(response.json().data.comments.at(-1).field, 'is_locked');
	assert.deepEqual(response.json().data.justification, savedJustification);
});

test('replacing a justification gives each version its own comment', async () => {
	FOUND = true;
	ACCEPTANCE.acceptance_status = 'under_review';
	const saved = RideJustificationSchema.parse({
		alert_id: 'alert-1',
		created_at: 1_800_000_000_000,
		created_by: 'system',
		justification_cause: 'WEATHER',
		justification_source: 'alert',
		pto_message: 'Original alert message',
		updated_at: 1_800_000_000_000,
	});
	ACCEPTANCE.justification = saved;
	const previousComments = structuredClone(ACCEPTANCE.comments);

	const reopened = await server.inject({ method: 'POST', payload: { acceptance_status: 'justification_required' }, url: '/status/ride' });
	assert.equal(reopened.statusCode, 200);
	assert.deepEqual(reopened.json().data.justification, saved);
	const reopenedComments = reopened.json().data.comments;
	assert.deepEqual(reopenedComments.slice(0, -1), previousComments);
	assert.equal(reopenedComments.at(-1).curr_value, 'justification_required');

	const response = await server.inject({ method: 'POST', payload: { justification_cause: 'WEATHER', pto_message: 'New manual justification' }, url: '/justifications/ride' });
	assert.equal(response.statusCode, 200);
	const { comments, justification } = response.json().data;
	assert.equal(justification.pto_message, 'New manual justification');
	assert.deepEqual(comments.slice(0, -3), reopenedComments);
	assert.equal(comments.at(-3).field, 'justification');
	assert.equal(comments.at(-3).created_at, saved.created_at);
	assert.deepEqual(comments.at(-3).curr_value, saved);
	assert.equal(comments.at(-2).curr_value, 'under_review');
	assert.equal(comments.at(-1).prev_value, undefined);
	assert.deepEqual(comments.at(-1).curr_value, justification);

	const replacement = await server.inject({ method: 'POST', payload: { justification_cause: 'WEATHER', pto_message: 'Another manual justification' }, url: '/justifications/ride' });
	assert.equal(replacement.statusCode, 200);
	const replacementComments = replacement.json().data.comments;
	assert.deepEqual(replacementComments.slice(0, -1), comments);
	assert.equal(replacementComments.at(-1).prev_value, undefined);
	assert.equal(replacementComments.at(-1).curr_value.pto_message, 'Another manual justification');
});

test('a justification submitted against an outdated version cannot replace a newer one', async () => {
	FOUND = true;
	ACCEPTANCE.acceptance_status = 'under_review';
	const previousJustification = RideJustificationSchema.parse(ACCEPTANCE.justification);
	const newerJustification = { ...previousJustification, pto_message: 'Newer justification' };
	const previousComments = structuredClone(ACCEPTANCE.comments);
	beforeWrite = () => { ACCEPTANCE.justification = newerJustification; };

	const response = await server.inject({ method: 'POST', payload: { justification_cause: 'WEATHER', pto_message: 'Outdated justification' }, url: '/justifications/ride' });
	assert.equal(response.statusCode, 409);
	assert.deepEqual(ACCEPTANCE.justification, newerJustification);
	assert.deepEqual(ACCEPTANCE.comments, previousComments);
});
