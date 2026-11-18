import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { listenPrometheusMetrics } from '../src/metrics/listen.js';

describe('listenPrometheusMetrics', () => {
	it('serves prometheus text on /metrics', async () => {
		const server = await listenPrometheusMetrics({
			host: '127.0.0.1',
			name: 'test_worker',
			port: 0,
		});

		try {
			const res = await fetch(`http://127.0.0.1:${server.port}/metrics`);
			assert.equal(res.status, 200);
			const body = await res.text();
			assert.match(body, /# HELP/);
			assert.match(body, /test_worker_/);
		}
		finally {
			await server.close();
		}
	});
});
