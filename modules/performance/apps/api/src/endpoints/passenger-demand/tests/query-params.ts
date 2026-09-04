/* * */

import { buildPassengerDemandBreakdownQueryInput, buildPassengerDemandOverTimeQueryInput, buildPassengerDemandProductivityQueryInput, buildPassengerDemandRecordsQueryInput, buildPassengerDemandResourceBreakdownQueryInput, buildPassengerDemandTotalQueryInput } from '@/endpoints/passenger-demand/query-params.js';
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

test('parses reusable breakdown, records, and productivity queries', () => {
	assert.deepEqual(buildPassengerDemandResourceBreakdownQueryInput({
		dimension: 'product',
		end_date: '2026-08-07',
		limit: '25',
		line_id: '4701',
		start_date: '2026-08-01',
	}), {
		dimension: 'product',
		end_date: 20260807,
		limit: 25,
		line_ids: ['4701'],
		start_date: 20260801,
	});

	const scopedQuery = {
		agency_id: '41',
		end_date: '2026-08-07',
		line_id: '4701',
		start_date: '2026-08-01',
	};
	const expected = { agency_id: '41', end_date: 20260807, line_id: '4701', start_date: 20260801 };
	assert.deepEqual(buildPassengerDemandRecordsQueryInput(scopedQuery), expected);
	assert.deepEqual(buildPassengerDemandProductivityQueryInput(scopedQuery), expected);
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

	assert.throws(() => buildPassengerDemandResourceBreakdownQueryInput({
		dimension: 'dashboard',
		end_date: '2026-08-07',
		start_date: '2026-08-01',
	}), isBadRequest);

	assert.throws(() => buildPassengerDemandResourceBreakdownQueryInput({
		dimension: 'product',
		end_date: '2026-08-07',
		hour_start: '6',
		start_date: '2026-08-01',
	}), isBadRequest);
});

/* * */
