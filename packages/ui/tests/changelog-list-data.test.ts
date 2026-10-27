import { strict as assert } from 'node:assert';
import { afterEach, describe, it, mock } from 'node:test';

import { getAllChangelogSummaries, markChangelogReleasesRead } from '../src/changelog/list/use-changelog-list-data.ts';

/* * */

function summary(_id: string, isSeen: boolean) {
	return { _id, category_counts: { bug_fix: 0, improvement: 1, new_feature: 0 }, is_seen: isSeen, published_at: 0, scope: { type: 'platform' }, summary: null, title: _id };
}

function apiResponse(data: unknown) {
	return new Response(JSON.stringify({ data, error: null, generated_at: null, status_code: '200', timestamp: Date.now() }));
}

/* * */

afterEach(() => mock.restoreAll());

describe('changelog read actions', () => {
	it('loads all summaries in one request and preserves their seen state', async () => {
		const requests: string[] = [];
		const items = Array.from({ length: 30 }, (_, index) => summary(`release-${index}`, index % 2 === 0));
		mock.method(globalThis, 'fetch', async (input: Request | string | URL) => {
			requests.push(String(input));
			return apiResponse(items);
		});
		const releases = await getAllChangelogSummaries();
		assert.equal(requests.length, 1);
		assert.equal(new URL(requests[0]).search, '');
		assert.deepEqual(releases, items);
		assert.equal(releases.filter(release => !release.is_seen).length, 15);
	});

	it('marks more than 100 releases using requests within the API limit', async () => {
		const ids = Array.from({ length: 205 }, (_, index) => `release-${index}`);
		const batches: string[][] = [];
		mock.method(globalThis, 'fetch', async (_input: Request | string | URL, options: RequestInit) => {
			assert.equal(options.method, 'POST');
			batches.push(JSON.parse(String(options.body)).release_ids);
			return apiResponse({ success: true });
		});
		const response = await markChangelogReleasesRead(ids);
		assert.equal(response.error, null);
		assert.deepEqual(batches.map(batch => batch.length), [100, 100, 5]);
		assert.deepEqual(batches.flat(), ids);
	});

	it('stops and reports an error when a batch fails', async () => {
		let requests = 0;
		mock.method(globalThis, 'fetch', async () => {
			requests++;
			return requests === 1 ? apiResponse({ success: true }) : new Response('', { status: 503 });
		});
		const response = await markChangelogReleasesRead(Array.from({ length: 205 }, (_, index) => `release-${index}`));
		assert.ok(response.error);
		assert.equal(requests, 2);
	});

	it('reports a feed request failure', async () => {
		mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }));
		await assert.rejects(getAllChangelogSummaries);
	});
});
