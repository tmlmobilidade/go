import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMetricsRegistry } from '../src/metrics/create-registry.js';

describe('createMetricsRegistry usage', () => {
	it('exposes process cpu and memory usage ratios', async () => {
		const { prefix, registry } = createMetricsRegistry({ name: 'api' });
		const body = await registry.metrics();

		assert.match(body, new RegExp(`${prefix}process_cpu_usage_ratio`));
		assert.match(body, new RegExp(`${prefix}process_memory_usage_ratio`));
	});
});
