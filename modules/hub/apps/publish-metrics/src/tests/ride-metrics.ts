/* * */

import { buildPublishedRideMetrics } from '@/helpers/ride-metrics.js';
import { buildRidePerformanceDay, type RidePerformanceSourceRow } from '@tmlmobilidade/go-performance-pckg-scripts';
import { validateOperationalDateInt, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';

/* * */

const operationalDateStart = validateUnixTimestamp(1_785_110_400_000);
const currentCutoff = validateUnixTimestamp(operationalDateStart + 8 * 60 * 60 * 1_000);

function createRide(overrides: Partial<RidePerformanceSourceRow> = {}): RidePerformanceSourceRow {
	return {
		agency_id: 'agency-a',
		expected_analysis_present: 1,
		expected_reason: 'LATE_START',
		extension_scheduled: 1_000,
		one_apex_analysis_present: 1,
		one_apex_grade_status: 'fail',
		processing_status: 'complete',
		ride_id: 'ride-a',
		seen_first_at: currentCutoff - 30 * 60_000,
		seen_last_at: currentCutoff - 3 * 60_000,
		start_time_delta_minutes: 6,
		start_time_observed: currentCutoff - 9 * 60_000,
		start_time_scheduled: currentCutoff - 10 * 60_000,
		three_events_analysis_present: 1,
		three_events_grade_status: 'pass',
		updated_at: currentCutoff - 60_000,
		...overrides,
	};
}

const ridePerformance = buildRidePerformanceDay([
	createRide(),
	createRide({
		expected_reason: 'UNKNOWN_START',
		extension_scheduled: 2_000,
		one_apex_grade_status: 'fail',
		ride_id: 'ride-without-evidence',
		seen_first_at: null,
		seen_last_at: null,
		start_time_delta_minutes: null,
		start_time_observed: null,
		three_events_grade_status: 'fail',
	}),
	createRide({
		ride_id: 'future-ride',
		start_time_scheduled: currentCutoff,
	}),
	createRide({
		expected_analysis_present: 0,
		expected_reason: null,
		one_apex_analysis_present: 0,
		one_apex_grade_status: null,
		ride_id: 'partially-analyzed-ride',
		start_time_delta_minutes: null,
		start_time_observed: null,
	}),
], {
	current_cutoff: currentCutoff,
	operational_date: validateOperationalDateInt(20260727),
	operational_date_start: operationalDateStart,
});
const rideMetrics = buildPublishedRideMetrics(ridePerformance);

assert.equal(rideMetrics.serviceCompliance.total.value?.executed_rides_qty, 1);
assert.equal(rideMetrics.serviceCompliance.total.value?.unexecuted_rides_qty, 1);
assert.equal(rideMetrics.departureDelays.total.value?.average_start_delay_minutes, 6);
assert.ok(Math.abs((rideMetrics.vkmExecution.total.value?.execution_pct ?? 0) - 100 / 3) < 0.000_001);

console.log('Ride metric publishing tests passed.');
