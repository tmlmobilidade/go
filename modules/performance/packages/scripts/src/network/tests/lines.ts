/* * */

import {
	createPerformanceNetworkLineId,
	parsePerformanceNetworkLineId,
} from '@tmlmobilidade/go-types-performance';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import test from 'node:test';

import {
	buildPerformanceNetworkLinesQuery,
	buildPerformanceNetworkPatternsQuery,
} from '../lines.js';

/* * */

test('creates and parses a composite network line ID', () => {
	const id = createPerformanceNetworkLineId('A2L1N', '4501');

	assert.equal(id, 'A2L1N:4501');
	assert.deepEqual(parsePerformanceNetworkLineId(id), {
		agency_id: 'A2L1N',
		line_id: '4501',
	});
	assert.deepEqual(parsePerformanceNetworkLineId('A2L1N%3A4501'), {
		agency_id: 'A2L1N',
		line_id: '4501',
	});
	assert.throws(() => parsePerformanceNetworkLineId('A2L1N:4501:extra'));
});

test('builds a period-scoped line query', () => {
	const result = buildPerformanceNetworkLinesQuery({
		agency_ids: ['A2L1N'],
		end_date: validateOperationalDateInt(20260818),
		start_date: validateOperationalDateInt(20260801),
	});

	assert.match(result.query, /FROM operation\.rides FINAL/);
	assert.match(result.query, /operational_date >= \$1/);
	assert.match(result.query, /operational_date <= \$2/);
	assert.match(result.query, /agency_id IN \$3/);
	assert.match(result.query, /argMax/);
	assert.deepEqual(result.params, {
		1: 20260801,
		2: 20260818,
		3: ['A2L1N'],
	});
});

test('builds a representative ride and hashed-trip pattern query', () => {
	const result = buildPerformanceNetworkPatternsQuery({
		agency_id: 'A2L1N',
		end_date: validateOperationalDateInt(20260818),
		line_id: '4501',
		start_date: validateOperationalDateInt(20260801),
	});

	assert.match(result.query, /splitByChar\('\|', trip_id\)\[1\]/);
	assert.match(result.query, /argMax\(/);
	assert.match(result.query, /operation\.hashed_trips AS hashed_trip FINAL/);
	assert.match(result.query, /argMin\(hashed_trip\.stop_name, hashed_trip\.stop_sequence\)/);
	assert.match(result.query, /argMax\(hashed_trip\.stop_name, hashed_trip\.stop_sequence\)/);
	assert.match(result.query, /ride\.metadata\.2 = hashed_trip\._id/);
});

