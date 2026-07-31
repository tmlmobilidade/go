/* * */

import { selectPassengerDemandMetrics } from '@/endpoints/v2/metrics/controllers/get-passenger-demand.js';
import { Dates } from '@tmlmobilidade/dates';
import { PassengerDemandMetricsSnapshotSchema } from '@tmlmobilidade/go-types-public-info';
import assert from 'node:assert/strict';

/* * */

const currentOperationalDate = 20260729;
const currentStart = Dates
	.fromOperationalDate('20260729', 'Europe/Lisbon')
	.unix_timestamp;
const pointTimestamp = currentStart + 60 * 60 * 1_000;
const comparisonDates = [20260708, 20260715, 20260722];

function comparisonDays(values: number[]) {
	return comparisonDates.map((operationalDate, index) => ({
		operational_date: operationalDate,
		points: [{
			interval_index: 4,
			interval_start: pointTimestamp - (comparisonDates.length - index) * 7 * 24 * 60 * 60 * 1_000,
			passenger_validations_qty: values[index],
		}],
	}));
}

const snapshot = PassengerDemandMetricsSnapshotSchema.parse({
	agencies: {
		'agency-a': {
			comparable_days: comparisonDays([0, 100, 100]),
			current_points: [{
				interval_index: 4,
				interval_start: pointTimestamp,
				passenger_validations_qty: 50,
			}],
			realtime: {
				comparison_index_pct: 50,
				passenger_validations_qty_last_week: 100,
				passenger_validations_qty_now: 50,
			},
		},
		'agency-b': {
			comparable_days: comparisonDays([100, 0, 100]),
			current_points: [{
				interval_index: 4,
				interval_start: pointTimestamp,
				passenger_validations_qty: 50,
			}],
			realtime: {
				comparison_index_pct: 50,
				passenger_validations_qty_last_week: 100,
				passenger_validations_qty_now: 50,
			},
		},
	},
	definition_version: 'passenger-demand-v2',
	meta: {
		baseline_sample_size_target: 8,
		current_cutoff: pointTimestamp + 10 * 60 * 1_000,
		current_operational_date: currentOperationalDate,
		generated_at: pointTimestamp + 10 * 60 * 1_000,
		interval_minutes: 15,
		last_week_cutoff: pointTimestamp + 10 * 60 * 1_000 - 7 * 24 * 60 * 60 * 1_000,
		last_week_operational_date: 20260722,
		source_watermark: pointTimestamp + 9 * 60 * 1_000,
	},
});

const complete = selectPassengerDemandMetrics(snapshot, ['agency-a', 'agency-b']);

assert.equal(complete.meta.status, 'complete');
assert.deepEqual(complete.meta.baseline_operational_dates, comparisonDates);
assert.equal(complete.total.value?.passenger_validations_qty_now, 100);
assert.equal(complete.total.value?.comparison_index_pct, 50);
assert.equal(complete.total.value?.typical_cumulative_qty, 100);
assert.equal(complete.total.value?.typical_comparison_index_pct, 100);
assert.equal(complete.total.value?.deviation_status, 'typical');
assert.equal(complete.total.trend[0]?.interval_start, currentStart);
assert.equal(complete.total.trend.length, 5);
assert.equal(complete.total.trend.at(-1)?.passenger_validations_qty, 100);

const bucketSnapshot = PassengerDemandMetricsSnapshotSchema.parse({
	...snapshot,
	agencies: {
		'agency-a': {
			...snapshot.agencies['agency-a'],
			comparable_days: comparisonDates.map(operationalDate => ({
				operational_date: operationalDate,
				points: [{
					interval_index: 0,
					interval_start: currentStart,
					passenger_validations_qty: 60,
				}],
			})),
			current_points: [{
				interval_index: 0,
				interval_start: currentStart,
				passenger_validations_qty: 75,
			}],
		},
	},
	meta: {
		...snapshot.meta,
		current_cutoff: currentStart + 3 * 60 * 1_000 - 1,
	},
});
const bucketed = selectPassengerDemandMetrics(bucketSnapshot, ['agency-a']);

assert.equal(bucketed.total.trend.length, 1);
assert.equal(bucketed.total.trend[0]?.interval_start, currentStart);
assert.equal(bucketed.total.trend[0]?.passenger_validations_qty, 75);
assert.deepEqual(bucketed.total.trend[0]?.typical, {
	lower: 60,
	median: 60,
	upper: 60,
});

const partial = selectPassengerDemandMetrics(snapshot, ['agency-a', 'missing']);

assert.equal(partial.meta.status, 'partial');
assert.deepEqual(partial.meta.unavailable_agency_ids, ['missing']);
assert.equal(partial.total.value, null);
assert.deepEqual(partial.total.trend, []);

console.log('Passenger demand metric selection tests passed.');
