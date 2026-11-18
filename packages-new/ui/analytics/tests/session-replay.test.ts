import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getReplayTimeRemaining, startSessionReplay } from '../src/utils/session-replay.js';

const serverNow = 1_700_000_000_000;
const activation = {
	activation_id: 'capture-1',
	expires_at: serverNow + 300_000,
	pending_expires_at: serverNow + 86_400_000,
	started_at: serverNow,
};
const data = { activation, server_now: serverNow, user_id: 'USER1' };

test('capture uses the server deadline and subtracts request time despite clock skew', async (context) => {
	let wallTime = 10_000;
	let monotonicTime = 1_000;
	context.mock.method(Date, 'now', () => wallTime);
	context.mock.method(performance, 'now', () => monotonicTime);
	context.mock.method(globalThis, 'fetch', async (_url: string, options: RequestInit) => {
		assert.equal(options.method, 'POST');
		assert.equal(options.credentials, 'include');
		assert.equal(options.cache, 'no-store');
		assert.deepEqual(JSON.parse(options.body as string), { activation_id: activation.activation_id });
		wallTime += 200;
		monotonicTime += 200;
		return Response.json({ data });
	});
	const deadline = await startSessionReplay('/start', 'USER1', activation.activation_id, new AbortController().signal);
	assert.equal(getReplayTimeRemaining(deadline), 299_800);
	wallTime -= 60_000;
	monotonicTime += 10_000;
	assert.equal(getReplayTimeRemaining(deadline), 289_800);
	wallTime = 310_000;
	assert.equal(getReplayTimeRemaining(deadline), 0);
});

test('reloading an active capture keeps the remaining server window', async (context) => {
	context.mock.method(Date, 'now', () => 10_000);
	context.mock.method(performance, 'now', () => 1_000);
	context.mock.method(globalThis, 'fetch', async () => Response.json({ data: { ...data, server_now: serverNow + 120_000 } }));
	const deadline = await startSessionReplay('/start', 'USER1', activation.activation_id, new AbortController().signal);
	assert.equal(getReplayTimeRemaining(deadline), 180_000);
});

test('a late response cannot authorize another user or activation', async (context) => {
	for (const invalid of [
		{ ...data, user_id: 'USER2' },
		{ ...data, activation: { ...activation, activation_id: 'capture-2' } },
		{ ...data, activation: null },
		{ ...data, activation: { ...activation, started_at: null, expires_at: null } },
	]) {
		context.mock.method(globalThis, 'fetch', async () => Response.json({ data: invalid }));
		await assert.rejects(startSessionReplay('/start', 'USER1', activation.activation_id, new AbortController().signal));
	}
});

test('an aborted request cannot resume capture even if the response arrives', async (context) => {
	const controller = new AbortController();
	context.mock.method(globalThis, 'fetch', async () => {
		controller.abort();
		return Response.json({ data });
	});
	await assert.rejects(startSessionReplay('/start', 'USER1', activation.activation_id, controller.signal));
});

test('rejected or malformed start responses do not produce a capture deadline', async (context) => {
	for (const response of [
		Response.json({ error: 'Authorization expired' }, { status: 409 }),
		Response.json({ error: 'Authorization expired' }),
		Response.json({ data: {} }),
	]) {
		context.mock.method(globalThis, 'fetch', async () => response);
		await assert.rejects(startSessionReplay('/start', 'USER1', activation.activation_id, new AbortController().signal));
	}
});
