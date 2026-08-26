/* * */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';

import { buildRidePerformanceByPatternQuery } from '../by-pattern.js';
import { normalizeRidePerformanceMetrics } from '../query-support.js';

/* * */

test('normalizes additive ride quantities into nullable percentages', () => {
	assert.deepEqual(normalizeRidePerformanceMetrics({
		advanced_rides_qty: 1,
		delay_eligible_rides_qty: 5,
		delayed_rides_qty: 2,
		execution_failure_rides_qty: 1,
		observed_start_rides_qty: 4,
		scheduled_rides_qty: 5,
	}), {
		advanced_rides_qty: 1,
		advances_pct: 25,
		coverage_pct: 80,
		delay_eligible_rides_qty: 5,
		delayed_rides_qty: 2,
		delays_pct: 50,
		execution_failure_rides_qty: 1,
		observed_start_rides_qty: 4,
		scheduled_rides_qty: 5,
		service_pct: 80,
	});

	assert.equal(normalizeRidePerformanceMetrics({
		advanced_rides_qty: 0,
		delay_eligible_rides_qty: 0,
		delayed_rides_qty: 0,
		execution_failure_rides_qty: 0,
		observed_start_rides_qty: 0,
		scheduled_rides_qty: 0,
	}).service_pct, null);
});

test('builds a bounded pattern query with line filters', () => {
	const result = buildRidePerformanceByPatternQuery({
		agency_ids: ['agency-a'],
		end_date: validateOperationalDateInt(20260818),
		exclude_unknown: true,
		line_ids: ['4701'],
		start_date: validateOperationalDateInt(20260801),
	});

	assert.match(result.query, /FROM performance\.ride_service_by_ride/u);
	assert.match(result.query, /GROUP BY pattern_id/u);
	assert.deepEqual(result.params[4], ['agency-a']);
	assert.deepEqual(result.params[5], ['4701']);
});
