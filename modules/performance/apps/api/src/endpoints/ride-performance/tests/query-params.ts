/* * */

import { buildRidePerformanceBreakdownInput, buildRidePerformanceComparisonInput, buildRidePerformanceOverTimeInput } from '@/endpoints/ride-performance/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import assert from 'node:assert/strict';
import test from 'node:test';

/* * */

test('parses ride-performance periods, dimensions, and grains', () => {
	assert.deepEqual(buildRidePerformanceOverTimeInput({
		agency_id: 'A2L1N',
		end_date: '2026-08-18',
		line_id: '4701',
		start_date: '2026-08-01',
		time_grain: 'day',
	}), {
		agency_ids: ['A2L1N'],
		end_date: 20260818,
		line_ids: ['4701'],
		start_date: 20260801,
		time_grain: 'day',
	});

	assert.deepEqual(buildRidePerformanceBreakdownInput({
		end_date: '2026-08-18',
		limit: '1000',
		start_date: '2026-08-01',
	}), {
		end_date: 20260818,
		limit: 1000,
		start_date: 20260801,
	});
});

test('parses explicit ride-performance comparison periods', () => {
	assert.deepEqual(buildRidePerformanceComparisonInput({
		comparison_end_date: '2026-07-18',
		comparison_start_date: '2026-07-01',
		current_end_date: '2026-08-18',
		current_start_date: '2026-08-01',
		line_id: '4701',
	}), {
		comparison_period: { end_date: 20260718, start_date: 20260701 },
		current_period: { end_date: 20260818, start_date: 20260801 },
		line_ids: ['4701'],
	});
});

test('rejects incomplete ride-performance ranges', () => {
	assert.throws(
		() => buildRidePerformanceComparisonInput({
			comparison_end_date: '2026-07-18',
			current_end_date: '2026-08-18',
			current_start_date: '2026-08-01',
		}),
		(error: unknown) => error instanceof HttpException && error.statusCode === HTTP_STATUS.BAD_REQUEST,
	);
});

/* * */
