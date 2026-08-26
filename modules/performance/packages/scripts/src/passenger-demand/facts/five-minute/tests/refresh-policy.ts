/* * */

import { Dates } from '@tmlmobilidade/dates';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCurrentPassengerDemandFiveMinuteRefreshRange, buildPassengerDemandFiveMinuteBackfillRange, buildRecentPassengerDemandFiveMinuteRefreshRange, listOperationalDates, PASSENGER_DEMAND_FIVE_MINUTE_BUCKET_MS } from '../refresh-policy.js';

/* * */

const referenceNow = Dates.fromISO('2026-08-17T15:32:27.000+01:00');

test('uses the canonical five-minute physical grain', () => {
	assert.equal(PASSENGER_DEMAND_FIVE_MINUTE_BUCKET_MS, 300_000);
});

test('builds a provisional current-date refresh', () => {
	assert.deepEqual(buildCurrentPassengerDemandFiveMinuteRefreshRange(referenceNow), {
		data_status: 'provisional',
		end_date: 20260817,
		refresh_type: 'incremental',
		source_cutoff: Math.floor(referenceNow.unix_timestamp / 300_000) * 300_000 - 1,
		start_date: 20260817,
	});
});

test('builds a fourteen-day closed-date reconciliation', () => {
	assert.deepEqual(buildRecentPassengerDemandFiveMinuteRefreshRange(referenceNow), {
		data_status: 'reconciled',
		end_date: 20260816,
		refresh_type: 'reconciliation',
		source_cutoff: referenceNow.unix_timestamp,
		start_date: 20260803,
	});
});

test('lists operational dates across month boundaries', () => {
	assert.deepEqual(
		listOperationalDates(validateOperationalDateInt(20260730), validateOperationalDateInt(20260802)),
		[20260730, 20260731, 20260801, 20260802],
	);
});

test('rejects inverted and current-date backfill ranges', () => {
	assert.throws(
		() => buildPassengerDemandFiveMinuteBackfillRange(validateOperationalDateInt(20260802), validateOperationalDateInt(20260801), referenceNow),
		/start date must not be after its end date/,
	);
	assert.throws(
		() => buildPassengerDemandFiveMinuteBackfillRange(validateOperationalDateInt(20260816), validateOperationalDateInt(20260817), referenceNow),
		/must only contain closed operational dates/,
	);
});

/* * */
