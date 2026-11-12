import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError } from '../src/fetch/api-error';
import { fetchApiData } from '../src/fetch/fetch-api-data';

test('fetch preserves non-2xx API messages, status and nested field details', async (context) => {
	const body = { data: null, error: 'dates.0.date: Required', issues: [{ code: 'invalid_type', message: 'Required', path: ['dates', 0, 'date'] }], status_code: '400', timestamp: Date.now() };
	context.mock.method(globalThis, 'fetch', async (_url, options: RequestInit) => {
		assert.equal(new Headers(options.headers).get('Accept-Language'), 'es');
		return new Response(JSON.stringify(body), { status: 400 });
	});
	const response = await fetchApiData({ headers: { 'accept-language': 'es' }, locale: 'en', url: '/test' });
	assert.deepEqual(response, body);
	assert.ok(response.error);
	if (response.status_code !== '400') assert.fail('Expected a validation response');
	const error = new ApiError(response.error, response);
	assert.equal(error.message, body.error);
	assert.equal(error.statusCode, '400');
	assert.deepEqual(error.fieldErrors, { 'dates.0.date': 'Required' });
});

test('proxy and network failures return readable errors without discarding HTTP status', async (context) => {
	context.mock.method(globalThis, 'fetch', async () => new Response('<html>unavailable</html>', { status: 503, statusText: 'Service Unavailable' }));
	const proxy = await fetchApiData({ url: '/test' });
	assert.equal(proxy.status_code, '503');
	assert.equal(proxy.error, 'HTTP 503 - Service Unavailable');
	context.mock.method(globalThis, 'fetch', async () => { throw new Error('Network unavailable'); });
	const network = await fetchApiData({ url: '/test' });
	assert.equal(network.status_code, '500');
	assert.equal(network.error, 'Network unavailable');
});

test('multipart uploads preserve validation responses and send the selected locale', async (context) => {
	const { fetchApiMultipart } = await import('../src/fetch/fetch-api-multipart');
	const body = { data: null, error: 'Invalid upload', issues: [{ code: 'custom', message: 'Invalid file', path: ['file'] }], status_code: '400', timestamp: Date.now() };
	context.mock.method(globalThis, 'fetch', async (_url, options: RequestInit) => {
		assert.equal(new Headers(options.headers).get('Accept-Language'), 'en');
		assert.equal(new Headers(options.headers).has('Content-Type'), false);
		return new Response(JSON.stringify(body), { status: 400 });
	});
	assert.deepEqual(await fetchApiMultipart('/upload', new FormData(), 'en'), body);
});
