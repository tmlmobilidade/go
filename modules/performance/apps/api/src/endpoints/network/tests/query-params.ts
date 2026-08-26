/* * */

import { HttpException } from '@tmlmobilidade/consts';
import assert from 'node:assert/strict';
import test from 'node:test';

import { parsePerformanceNetworkLineIdentity, parsePerformanceNetworkLinesQuery } from '../query-params.js';

/* * */

test('parses the required period and repeated agency IDs', () => {
	assert.deepEqual(parsePerformanceNetworkLinesQuery({
		agency_ids: ['A2L1N', 'IA9T6'],
		end_date: '2026-08-18',
		start_date: '2026-08-01',
	}), {
		agency_ids: ['A2L1N', 'IA9T6'],
		end_date: 20260818,
		start_date: 20260801,
	});
});

test('rejects a missing network period', () => {
	assert.throws(
		() => parsePerformanceNetworkLinesQuery({}),
		(error: unknown) => error instanceof HttpException,
	);
});

test('parses and validates a composite line ID', () => {
	assert.deepEqual(parsePerformanceNetworkLineIdentity('A2L1N:4501'), {
		agency_id: 'A2L1N',
		line_id: '4501',
	});
	assert.deepEqual(parsePerformanceNetworkLineIdentity('A2L1N%3A4501'), {
		agency_id: 'A2L1N',
		line_id: '4501',
	});
	assert.throws(
		() => parsePerformanceNetworkLineIdentity('4501'),
		(error: unknown) => error instanceof HttpException,
	);
});
