/* * */

import {
	calculateVideowallRide,
	type VideowallRide,
} from '@/helpers/videowall-service.js';
import { buildVideowallMetricsSnapshot } from '@/tasks/videowall.js';
import assert from 'node:assert/strict';

/* * */

const result = buildVideowallMetricsSnapshot(
	{
		agencies: {
			'agency-a': {
				comparison_index_pct: 125,
				passenger_validations_qty_last_week: 80,
				passenger_validations_qty_now: 100,
			},
		},
		current_cutoff: 1_785_168_000_000,
		current_operational_date: 20260727,
		definition_version: 'passenger-demand-v2',
		generated_at: 1_785_168_000_000,
		last_week_cutoff: 1_784_563_200_000,
		last_week_operational_date: 20260720,
	},
	{
		agencies: {
			'agency-a': {
				delays: {
					average_start_delay_minutes: 5,
					delayed_for_more_than_five_minutes_rides_qty: 1,
					start_delay_sample_qty: 2,
				},
				sla: {
					scheduled_rides_total_qty: 10,
					scheduled_rides_until_cutoff_qty: 8,
					simple_one_apex_validation_fail_rides_qty: 2,
					simple_three_vehicle_events_fail_rides_qty: 3,
					simple_three_vehicle_events_or_apex_validation_fail_rides_qty: 1,
				},
				vkm: {
					scheduled_distance_km: 10,
					simple_one_apex_validation_distance_km: 8,
					simple_three_vehicle_events_distance_km: 7,
					simple_three_vehicle_events_or_apex_validation_distance_km: 9,
				},
			},
		},
		definition_version: 'videowall-service-legacy-v1',
		eligible_scheduled_cutoff: 1_785_167_700_000,
		generated_at: 1_785_168_000_000,
		operational_date: 20260727,
		reference_cutoff: 1_785_168_000_000,
	},
);

assert.equal(result.agencies['agency-a']?.demand?.comparison_index_pct, 125);
assert.equal(result.agencies['agency-a']?.service?.delays.average_start_delay_minutes, 5);
assert.equal(result.agencies['agency-a']?.service?.vkm.scheduled_distance_km, 10);
assert.equal(result.meta.sources_aligned, true);

/* * */

function createRide(overrides: Partial<VideowallRide> = {}): VideowallRide {
	return {
		agency_id: 'agency-a',
		analysis: {
			EXPECTED_START_TIME: { reason: 'LATE_START', value: 6 },
			SIMPLE_ONE_APEX_VALIDATION: { grade: 'fail' },
			SIMPLE_THREE_VEHICLE_EVENTS: { grade: 'pass' },
		},
		extension_scheduled: 1_000,
		seen_first_at: 800_000,
		seen_last_at: 1_000_000,
		start_time_observed: 800_000,
		start_time_scheduled: 700_000,
		system_status: 'complete',
		...overrides,
	};
}

const boundaries = {
	eligibleScheduledCutoff: 1_000_000,
	referenceCutoff: 1_300_000,
};
const rideFacts = calculateVideowallRide(createRide(), boundaries);

assert.deepEqual(rideFacts, {
	delays: {
		delayed_for_more_than_five_minutes_rides_qty: 1,
		start_delay_minutes_sum: 6,
		start_delay_sample_qty: 1,
	},
	sla: {
		scheduled_rides_total_qty: 1,
		scheduled_rides_until_cutoff_qty: 1,
		simple_one_apex_validation_fail_rides_qty: 1,
		simple_three_vehicle_events_fail_rides_qty: 0,
		simple_three_vehicle_events_or_apex_validation_fail_rides_qty: 0,
	},
	vkm: {
		scheduled_distance_m: 1_000,
		simple_one_apex_validation_distance_m: 0,
		simple_three_vehicle_events_distance_m: 1_000,
		simple_three_vehicle_events_or_apex_validation_distance_m: 1_000,
	},
});

const missingEvidenceFacts = calculateVideowallRide(
	createRide({
		analysis: {
			EXPECTED_START_TIME: { reason: 'UNKNOWN_START', value: null },
			SIMPLE_ONE_APEX_VALIDATION: { grade: 'fail' },
			SIMPLE_THREE_VEHICLE_EVENTS: { grade: 'fail' },
		},
		seen_first_at: null,
		seen_last_at: null,
		start_time_observed: null,
	}),
	boundaries,
);

assert.equal(missingEvidenceFacts.sla.simple_one_apex_validation_fail_rides_qty, 1);
assert.equal(missingEvidenceFacts.sla.simple_three_vehicle_events_fail_rides_qty, 1);
assert.equal(missingEvidenceFacts.sla.simple_three_vehicle_events_or_apex_validation_fail_rides_qty, 1);
assert.equal(missingEvidenceFacts.vkm.scheduled_distance_m, 1_000);

const futureRideFacts = calculateVideowallRide(
	createRide({
		start_time_scheduled: boundaries.eligibleScheduledCutoff + 1,
	}),
	boundaries,
);

assert.equal(futureRideFacts.sla.scheduled_rides_total_qty, 1);
assert.equal(futureRideFacts.sla.scheduled_rides_until_cutoff_qty, 0);
assert.equal(futureRideFacts.vkm.scheduled_distance_m, 0);

console.log('Videowall v2 publishing tests passed.');
