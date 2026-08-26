/* * */

import { buildPassengerDemandBreakdownQueryInput, buildPassengerDemandComparisonQueryInput, buildPassengerDemandLineDashboardQueryInput, buildPassengerDemandOverTimeQueryInput, buildPassengerDemandTotalQueryInput } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import assert from 'node:assert/strict';
import test from 'node:test';

/* * */

test('parses a bounded total query and common filters', () => {
	assert.deepEqual(buildPassengerDemandTotalQueryInput({
		agency_id: '41',
		data_statuses: ['provisional,reconciled'],
		end_date: '2026-08-07',
		exclude_unknown: 'true',
		hour_end: '9',
		hour_start: '6',
		line_ids: ['4701,4702', '4701'],
		start_date: '2026-08-01',
	}), {
		agency_ids: ['41'],
		data_statuses: ['provisional', 'reconciled'],
		end_date: 20260807,
		exclude_unknown: true,
		hour_end: 9,
		hour_start: 6,
		line_ids: ['4701', '4702'],
		start_date: 20260801,
	});
});

test('parses over-time grain and breakdown limit', () => {
	assert.deepEqual(buildPassengerDemandOverTimeQueryInput({
		end_date: '2026-08-07',
		pattern_id: '4701_0_1',
		start_date: '2026-08-01',
		time_grain: 'hour',
	}), {
		end_date: 20260807,
		pattern_ids: ['4701_0_1'],
		start_date: 20260801,
		time_grain: 'hour',
	});

	assert.deepEqual(buildPassengerDemandBreakdownQueryInput({
		end_date: '2026-08-07',
		limit: '25',
		start_date: '2026-08-01',
	}), {
		end_date: 20260807,
		limit: 25,
		start_date: 20260801,
	});
});

test('parses a line-dashboard query with current, comparison, and record periods', () => {
	assert.deepEqual(buildPassengerDemandLineDashboardQueryInput({
		agency_id: '41',
		comparison_end_date: '2026-07-31',
		comparison_start_date: '2026-07-01',
		current_end_date: '2026-08-31',
		current_start_date: '2026-08-01',
		line_id: '4701',
		record_end_date: '2026-08-31',
		record_start_date: '2025-09-01',
	}), {
		agency_id: '41',
		comparison_period: { end_date: 20260731, start_date: 20260701 },
		current_period: { end_date: 20260831, start_date: 20260801 },
		line_id: '4701',
		record_period: { end_date: 20260831, start_date: 20250901 },
	});
});

test('parses explicit current and comparison periods', () => {
	assert.deepEqual(buildPassengerDemandComparisonQueryInput({
		comparison_end_date: '2026-07-31',
		comparison_start_date: '2026-07-25',
		current_end_date: '2026-08-07',
		current_start_date: '2026-08-01',
		line_id: '4701',
	}), {
		comparison_period: { end_date: 20260731, start_date: 20260725 },
		current_period: { end_date: 20260807, start_date: 20260801 },
		line_ids: ['4701'],
	});
});

test('rejects missing and invalid HTTP query parameters as bad requests', () => {
	const isBadRequest = (error: unknown) => (
		error instanceof HttpException && error.statusCode === HTTP_STATUS.BAD_REQUEST
	);

	assert.throws(() => buildPassengerDemandTotalQueryInput({
		end_date: '2026-08-07',
	}), isBadRequest);

	assert.throws(() => buildPassengerDemandTotalQueryInput({
		end_date: '2026-08-07',
		exclude_unknown: 'yes',
		start_date: '2026-08-01',
	}), isBadRequest);

	assert.throws(() => buildPassengerDemandOverTimeQueryInput({
		end_date: '2026-08-07',
		hour_start: '6',
		start_date: '2026-08-01',
		time_grain: 'hour',
	}), isBadRequest);

	assert.throws(() => buildPassengerDemandComparisonQueryInput({
		comparison_end_date: '2026-07-31',
		current_end_date: '2026-08-07',
		current_start_date: '2026-08-01',
	}), isBadRequest);
});

/* * */
