import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock, test } from 'node:test';
import * as React from 'react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import type { useSWRConfig as useSWRConfigType } from 'swr';

// Match the CommonJS entry used by the frontend's TSX modules in this Node harness.
const { useSWRConfig }: { useSWRConfig: typeof useSWRConfigType } = createRequire(import.meta.url)('swr');

let RESPONSE: { data: unknown, error: null | string } = { data: null, error: null };
mock.module('@tmlmobilidade/ui', {
	namedExports: { fetchApiData: async () => RESPONSE },
});

// Next supplies the JSX runtime; this Node-only render supplies the equivalent binding.
Object.defineProperty(globalThis, 'React', { configurable: true, value: React });

const { ThemeProviders } = await import('../apps/frontend/src/providers/theme-providers.js');

test('Performance configures a fetcher that makes API metric arrays available to its widgets', async () => {
	let fetcher: ReturnType<typeof useSWRConfig>['fetcher'];
	function Probe() {
		fetcher = useSWRConfig().fetcher;
		return null;
	}
	renderToString(createElement(ThemeProviders, null, createElement(Probe)));
	assert.equal(typeof fetcher, 'function', 'Performance widgets must have a configured SWR fetcher');
	assert.ok(fetcher);
	const metrics = [{ data: { total: { now: 708779, last_week: 779167 } }, metric: 'realtime_demand' }];
	RESPONSE = { data: metrics, error: null };
	assert.deepEqual(await fetcher('/metrics/realtime_demand'), metrics);
	RESPONSE = { data: [], error: null };
	assert.deepEqual(await fetcher('/network/lines'), []);
	RESPONSE = { data: null, error: 'HTTP 401 - Unauthorized' };
	await assert.rejects(() => fetcher!('/metrics/realtime_demand'), /Unauthorized/);
});
