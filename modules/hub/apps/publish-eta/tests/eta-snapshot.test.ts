import assert from 'node:assert/strict';
import { test } from 'node:test';

import { writeEtaSnapshot } from '../src/tasks/simplified/write-eta-snapshot.ts';

test('empty snapshot removes old agency groups without deleting another agency', async () => {
	const values = new Map([['hub:v1:a:realtime:eta:by-stop:old', 'old'], ['hub:v1:b:realtime:eta:by-stop:old', 'other']]);
	const cache = {
		deleteMany: async (keys: string[]) => { keys.forEach(key => values.delete(key)); },
		scan: async (pattern: string) => [...values.keys()].filter(key => key.startsWith(pattern.slice(0, -1))),
		set: async (key: string, value: string) => { values.set(key, value); },
	};
	await writeEtaSnapshot(cache, 'a', [], 60);
	assert.equal(values.has('hub:v1:a:realtime:eta:by-stop:old'), false);
	assert.equal(values.get('hub:v1:b:realtime:eta:by-stop:old'), 'other');
	assert.equal(values.get('hub:v1:a:realtime:eta:all'), '[]');
});

test('failed snapshot does not prune the previous generation', async () => {
	let deleted = false;
	const cache = {
		deleteMany: async () => { deleted = true; },
		scan: async () => ['hub:v1:a:realtime:eta:by-stop:old'],
		set: async () => { throw new Error('redis unavailable'); },
	};
	await assert.rejects(writeEtaSnapshot(cache, 'a', [], 60));
	assert.equal(deleted, false);
});
