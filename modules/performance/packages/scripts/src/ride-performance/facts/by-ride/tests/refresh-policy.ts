/* * */

import { Dates } from '@tmlmobilidade/dates';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import test from 'node:test';

import { POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY } from '../refresh.js';
import { buildCurrentRidePerformanceRefreshRange, buildRecentRidePerformanceRefreshRange, buildRidePerformanceBackfillRange, listRidePerformanceOperationalDates, RIDE_PERFORMANCE_REFRESH_INTERVAL_MS } from '../refresh-policy.js';

/* * */

const referenceNow = Dates.fromISO('2026-08-17T15:32:27.000+01:00');

test('builds a provisional refresh on the last closed five-minute boundary', () => {
	assert.equal(RIDE_PERFORMANCE_REFRESH_INTERVAL_MS, 300_000);
	assert.deepEqual(buildCurrentRidePerformanceRefreshRange(referenceNow), {
		data_status: 'provisional',
		end_date: 20260817,
		refresh_type: 'incremental',
		source_cutoff: Math.floor(referenceNow.unix_timestamp / 300_000) * 300_000 - 1,
		start_date: 20260817,
	});
});

test('builds a fourteen-date reconciliation ending on the previous date', () => {
	assert.deepEqual(buildRecentRidePerformanceRefreshRange(referenceNow), {
		data_status: 'reconciled',
		end_date: 20260816,
		refresh_type: 'reconciliation',
		source_cutoff: referenceNow.unix_timestamp,
		start_date: 20260803,
	});
});

test('lists dates and bounds backfills to closed operational dates', () => {
	assert.deepEqual(
		listRidePerformanceOperationalDates(validateOperationalDateInt(20260730), validateOperationalDateInt(20260802)),
		[20260730, 20260731, 20260801, 20260802],
	);
	assert.throws(
		() => buildRidePerformanceBackfillRange(validateOperationalDateInt(20260817), validateOperationalDateInt(20260817), referenceNow),
		/closed operational dates/,
	);
	assert.throws(
		() => buildRidePerformanceBackfillRange(
			validateOperationalDateInt(20260701),
			validateOperationalDateInt(20260801),
			referenceNow,
		),
		/limited to 31 dates/,
	);
});

test('keeps canonical classification predicates aligned with the direct query', () => {
	assert.match(POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY, /operation\.rides AS rides FINAL/);
	assert.match(POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY, /source_cutoff:UInt64\} - 300000/);
	assert.match(POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY, /source_cutoff:UInt64\} - 120000/);
	assert.match(POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY, /NOT one_apex_passed AND NOT three_events_passed/);
	assert.match(POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY, /expected_reason = 'LATE_START'/);
	assert.match(POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY, /expected_reason = 'EARLY_START'/);
	assert.match(POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY, /toUInt8\(has_delay_observation\) AS observed_start_rides_qty/);
});

/* * */
