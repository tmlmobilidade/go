/* * */

import assert from 'node:assert/strict';

import { toPassengerDemandComparison, toRidePerformanceComparison } from '../baseline-comparison';

/* * */

assert.deepEqual(toPassengerDemandComparison({
	current: { passenger_demand: 120 },
	delta: { passenger_demand: 20 },
	meta: {
		baseline_operational_dates: [20260811 as never],
		baseline_sample_size: 1,
		baseline_sample_target: 8,
	},
	typical: { lower: 90, median: 100, upper: 110 },
}), {
	comparison_qty: 100,
	current_qty: 120,
	difference_pct: 20,
	difference_qty: 20,
});

assert.equal(toRidePerformanceComparison({
	current: {
		advanced_rides_qty: 1,
		advances_pct: 4,
		coverage_pct: 95,
		delay_eligible_rides_qty: 50,
		delayed_rides_qty: 5,
		delays_pct: 10,
		execution_failure_rides_qty: 1,
		observed_start_rides_qty: 48,
		scheduled_rides_qty: 50,
		service_pct: 96,
	},
	delta_pp: { advances: -1, delays: 2, service: -2 },
	meta: {
		baseline_operational_dates: [20260811 as never],
		baseline_sample_size: 1,
		baseline_sample_target: 8,
	},
	typical: {
		advances_pct: { lower: 3, median: 5, upper: 6 },
		delays_pct: { lower: 7, median: 8, upper: 9 },
		service_pct: { lower: 97, median: 98, upper: 99 },
	},
}).service_delta_pp, -2);

console.log('baseline-comparison tests passed.');

/* * */
