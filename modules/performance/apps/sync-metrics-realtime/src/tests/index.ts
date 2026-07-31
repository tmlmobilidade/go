/* * */

import { mergeDemandRowsWithExistingKeys } from '@/handlers/passenger-demand/demand-facts.js';
import { getCurrentRefreshRange, getHourlyReconciliationRange, getNightlyReconciliationRange, markCurrentRefreshCompleted, markHourlyReconciliationCompleted, markNightlyReconciliationCompleted } from '@/handlers/passenger-demand/refresh-cadence.js';
import { Dates } from '@tmlmobilidade/dates';
import { validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';

/* * */

const calculatedAt = validateUnixTimestamp(1_785_326_400_000);
const rows = mergeDemandRowsWithExistingKeys(
	[
		{
			accepted_validations_qty: '12',
			agency_id: 'agency-a',
			interval_start: 1_785_326_100_000,
			operational_date: 20260729,
			source_watermark: 1_785_326_200_000,
		},
	],
	[
		{
			agency_id: 'agency-a',
			interval_start: 1_785_325_800_000,
			operational_date: 20260729,
		},
		{
			agency_id: 'agency-a',
			interval_start: 1_785_326_100_000,
			operational_date: 20260729,
		},
	],
	calculatedAt,
);

assert.equal(rows.length, 2);
assert.equal(
	rows.find(row => row.interval_start === 1_785_326_100_000)?.accepted_validations_qty,
	12,
);
assert.equal(
	rows.find(row => row.interval_start === 1_785_325_800_000)?.accepted_validations_qty,
	0,
);
assert.ok(rows.every(row => row.calculated_at === calculatedAt));

const referenceNow = Dates.fromISO('2026-07-29T15:32:27.000+01:00');

const currentRange = getCurrentRefreshRange(referenceNow);
assert.ok(currentRange);
assert.equal(currentRange.start, 20260729);
assert.equal(currentRange.end, 20260729);
assert.equal(
	currentRange.cutoff,
	Math.floor(referenceNow.unix_timestamp / 60_000) * 60_000 - 1,
);
assert.equal(currentRange.type, 'incremental');
markCurrentRefreshCompleted(currentRange.cutoff);
assert.equal(getCurrentRefreshRange(referenceNow), null);

const hourlyRange = getHourlyReconciliationRange(referenceNow);
assert.equal(hourlyRange?.start, 20260727);
assert.equal(hourlyRange?.end, 20260728);
assert.equal(hourlyRange?.type, 'reconciliation');
markHourlyReconciliationCompleted(referenceNow);
assert.equal(getHourlyReconciliationRange(referenceNow), null);

const nightlyRange = getNightlyReconciliationRange(referenceNow);
assert.equal(nightlyRange?.start, 20260715);
assert.equal(nightlyRange?.end, 20260728);
assert.equal(nightlyRange?.type, 'reconciliation');
markNightlyReconciliationCompleted(referenceNow);
assert.equal(getNightlyReconciliationRange(referenceNow), null);

console.log('Realtime metrics refresh tests passed.');
