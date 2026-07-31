/* * */

import { selectVideowallMetrics } from '@/endpoints/v2/metrics/controllers/get-videowall.js';
import { VideowallMetricsSnapshotSchema } from '@tmlmobilidade/go-types-public-info';
import assert from 'node:assert/strict';

/* * */

const snapshot = VideowallMetricsSnapshotSchema.parse({
	agencies: {
		'agency-a': {
			demand: {
				comparison_index_pct: 125,
				passenger_validations_qty_last_week: 80,
				passenger_validations_qty_now: 100,
			},
			service: {
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
		'agency-b': {
			demand: {
				comparison_index_pct: 250,
				passenger_validations_qty_last_week: 20,
				passenger_validations_qty_now: 50,
			},
			service: {
				delays: {
					average_start_delay_minutes: 10,
					delayed_for_more_than_five_minutes_rides_qty: 2,
					start_delay_sample_qty: 2,
				},
				sla: {
					scheduled_rides_total_qty: 20,
					scheduled_rides_until_cutoff_qty: 16,
					simple_one_apex_validation_fail_rides_qty: 4,
					simple_three_vehicle_events_fail_rides_qty: 6,
					simple_three_vehicle_events_or_apex_validation_fail_rides_qty: 2,
				},
				vkm: {
					scheduled_distance_km: 20,
					simple_one_apex_validation_distance_km: 16,
					simple_three_vehicle_events_distance_km: 14,
					simple_three_vehicle_events_or_apex_validation_distance_km: 18,
				},
			},
		},
	},
	definition_version: 'videowall-v2',
	meta: {
		demand: {
			current_cutoff: 1_785_168_000_000,
			current_operational_date: 20260727,
			definition_version: 'passenger-demand-v2',
			generated_at: 1_785_168_000_000,
			last_week_cutoff: 1_784_563_200_000,
			last_week_operational_date: 20260720,
		},
		service: {
			definition_version: 'videowall-service-legacy-v1',
			eligible_scheduled_cutoff: 1_785_167_700_000,
			generated_at: 1_785_168_000_000,
			operational_date: 20260727,
			reference_cutoff: 1_785_168_000_000,
		},
		sources_aligned: true,
	},
});

/* * */

const complete = selectVideowallMetrics(snapshot, ['agency-a', 'agency-b']);

assert.equal(complete.meta.status, 'complete');
assert.equal(complete.total.demand?.passenger_validations_qty_now, 150);
assert.equal(complete.total.demand?.comparison_index_pct, 150);
assert.equal(complete.total.service?.delays.average_start_delay_minutes, 7.5);
assert.equal(complete.total.service?.vkm.scheduled_distance_km, 30);

const partial = selectVideowallMetrics(snapshot, ['agency-a', 'missing-agency']);

assert.equal(partial.meta.status, 'partial');
assert.deepEqual(partial.meta.unavailable_demand_agency_ids, ['missing-agency']);
assert.deepEqual(partial.meta.unavailable_service_agency_ids, ['missing-agency']);
assert.equal(partial.total.demand, null);
assert.equal(partial.total.service, null);

console.log('Videowall v2 selection tests passed.');
