import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import Fastify from 'fastify';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';

import { setupErrorHandler } from '../src/hooks/error-handler.js';
import { sendErrorApiResponse } from '../src/response/send-error-response.js';

test('HTTP validation errors expose localized field issues and preserve legacy string errors', async () => {
	const server = Fastify();
	const schema = z.object({ dates: z.array(z.object({ date: OperationalDateIntSchema })) });
	server.post('/', (request, reply) => {
		const result = schema.safeParse(request.body);
		if (!result.success) return sendErrorApiResponse(reply, { error: result.error, status_code: '400' });
		return result.data;
	});
	server.get('/missing', (_request, reply) => sendErrorApiResponse(reply, { error: 'Not found', status_code: '404' }));
	try {
		const english = await server.inject({ headers: { 'accept-language': 'en' }, method: 'POST', payload: { dates: [{ date: 'private-invalid-input' }] }, url: '/' });
		assert.equal(english.statusCode, 400);
		assert.deepEqual(english.json().issues, [{ code: 'custom', message: 'Expected a date in the format yyyyMMdd or yyyy-MM-dd', path: ['dates', 0, 'date'] }]);
		assert.match(english.json().error, /dates.0.date: Expected/);
		assert.doesNotMatch(english.body, /private-invalid-input|zodI18n|params|input/);
		const portuguese = await server.inject({ method: 'POST', payload: { dates: [{}] }, url: '/' });
		assert.equal(portuguese.json().issues[0].message, 'Este campo é obrigatório');
		const legacy = await server.inject('/missing');
		assert.equal(legacy.json().error, 'Not found');
		assert.equal(legacy.json().issues, undefined);
	} finally {
		await server.close();
	}
});

test('unexpected schema and application failures remain generic server errors', async () => {
	const server = Fastify();
	setupErrorHandler(server, () => 'test');
	server.get('/schema', () => z.string().parse({ internal: 'private' }));
	server.get('/error', () => {
		throw new Error('private database details');
	});
	try {
		for (const url of ['/schema', '/error']) {
			const response = await server.inject(url);
			assert.equal(response.statusCode, 500);
			assert.equal(response.json().error, 'Internal server error');
			assert.equal(response.json().issues, undefined);
			assert.doesNotMatch(response.body, /private|expected|stack/);
		}
	} finally {
		await server.close();
	}
});
