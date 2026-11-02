import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { fetchApiData } from '../src/fetch/fetch-api-data';

/* * */

test('preserves a 400 validation response instead of replacing it with HTTP 400', async (context) => {
	const response = {
		data: null,
		error: JSON.stringify([{ message: 'Invalid severity: forbidden', path: ['plans', 'validation_rules', 'fare_rules_contains_id_field', 'severity'] }]),
		status_code: '400',
		timestamp: 1793014300000,
	};
	context.mock.method(globalThis, 'fetch', async () => Response.json(response, { status: 400 }));

	assert.deepEqual(await fetchApiData({ body: { plans: {} }, method: 'PUT', url: 'https://example.test/agencies/ABBAA' }), response);
});

test('preserves the HTTP status when a failed response is not JSON', async (context) => {
	context.mock.method(globalThis, 'fetch', async () => new Response('Bad gateway', { status: 502, statusText: 'Bad Gateway' }));
	const response = await fetchApiData({ url: 'https://example.test/agencies/ABBAA' });

	assert.equal(response.status_code, '502');
	assert.equal(response.error, 'HTTP 502 - Bad Gateway');
});

test('returns the successfully saved agency and sends the corrected severity', async (context) => {
	const body = { plans: { validation_rules: { fare_rules_contains_id_field: { depends_on: [], severity: 'ignore' } } } };
	const response = { data: { _id: 'ABBAA', ...body }, error: null, generated_at: null, status_code: '200', timestamp: 1793014300000 };
	const fetchMock = context.mock.method(globalThis, 'fetch', async (_url: string, options: RequestInit) => {
		assert.deepEqual(JSON.parse(String(options.body)), body);
		assert.equal(options.method, 'PUT');
		return Response.json(response);
	});

	assert.deepEqual(await fetchApiData({ body, method: 'PUT', url: 'https://example.test/agencies/ABBAA' }), response);
	assert.equal(fetchMock.mock.callCount(), 1);
});

test('converts network failures into an error response', async (context) => {
	context.mock.method(globalThis, 'fetch', async () => {
		throw new Error('Network unavailable');
	});
	const response = await fetchApiData({ url: 'https://example.test/agencies/ABBAA' });

	assert.equal(response.status_code, '500');
	assert.equal(response.error, 'Network unavailable');
});
