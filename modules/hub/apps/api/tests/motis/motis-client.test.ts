import { fetchMotisJson } from '@/endpoints/v1/motis/motis-client.js';
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

/* * */

const originalFetch = globalThis.fetch;
const TestResponseSchema = { parse: (data: unknown) => data as { journeys: unknown[] } };

afterEach(() => {
	globalThis.fetch = originalFetch;
});

/* * */

describe('MOTIS client', () => {
	it('bounds upstream requests with an abort signal', async () => {
		globalThis.fetch = async (_input, init) => {
			assert.equal(init?.signal instanceof AbortSignal, true);

			return new Response(JSON.stringify({ journeys: [] }));
		};

		const response = await fetchMotisJson('/api/v6/plan', {}, TestResponseSchema);

		assert.deepEqual(response, { data: { journeys: [] }, error: null });
	});
});
