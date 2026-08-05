/* * */

import { selectDepartureDelayMetrics, selectServiceComplianceMetrics, selectVkmExecutionMetrics } from '@/endpoints/v2/metrics/controllers/get-ride-metrics.js';
import { DepartureDelayMetricsSchema, ServiceComplianceMetricsSchema, VkmExecutionMetricsSchema } from '@tmlmobilidade/go-types-public-info';
import assert from 'node:assert/strict';

/* * */

const metricMeta = {
	current_cutoff: 1_785_168_000_000,
	current_operational_date: 20260727,
	generated_at: 1_785_168_000_000,
	requested_agency_ids: ['agency-a', 'agency-b'],
	status: 'complete' as const,
	target_pct: 95,
	unavailable_agency_ids: [],
};
const serviceCompliance = ServiceComplianceMetricsSchema.parse({
	agencies: [
		{
			agency_id: 'agency-a',
			availability: true,
			trend: [{ compliance_pct: 90, executed_rides_qty: 9, interval_start: 1_785_139_200_000, scheduled_rides_qty: 10 }],
			value: { compliance_pct: 90, compliance_status: 'below_target', executed_rides_qty: 9, rides_without_execution_evidence_qty: 1, scheduled_rides_qty: 10, unexecuted_rides_qty: 1 },
		},
		{
			agency_id: 'agency-b',
			availability: true,
			trend: [{ compliance_pct: 90, executed_rides_qty: 18, interval_start: 1_785_139_200_000, scheduled_rides_qty: 20 }],
			value: { compliance_pct: 90, compliance_status: 'below_target', executed_rides_qty: 18, rides_without_execution_evidence_qty: 1, scheduled_rides_qty: 20, unexecuted_rides_qty: 2 },
		},
	],
	definition_version: 'service-compliance-v1',
	meta: { ...metricMeta, interval_minutes: 120 },
	total: { trend: [], value: null },
});
const selectedServiceCompliance = selectServiceComplianceMetrics(serviceCompliance, ['agency-a', 'agency-b']);

assert.equal(selectedServiceCompliance.total.value?.scheduled_rides_qty, 30);
assert.equal(selectedServiceCompliance.total.value?.executed_rides_qty, 27);
assert.equal(selectedServiceCompliance.total.trend[0]?.compliance_pct, 90);

const partialServiceCompliance = selectServiceComplianceMetrics(serviceCompliance, ['agency-a', 'missing-agency']);
assert.equal(partialServiceCompliance.meta.status, 'partial');
assert.equal(partialServiceCompliance.total.value, null);

const departureDelays = DepartureDelayMetricsSchema.parse({
	agencies: [
		{
			agency_id: 'agency-a',
			availability: true,
			trend: [{ delay_10_to_20_minutes_rides_qty: 0, delay_5_to_10_minutes_rides_qty: 1, delay_more_than_20_minutes_rides_qty: 0, delayed_more_than_five_minutes_pct: 50, interval_start: 1_785_139_200_000, observed_rides_qty: 2 }],
			value: { average_start_delay_minutes: 5, coverage_pct: 100, delay_status: 'above_target', delayed_more_than_five_minutes_pct: 50, delayed_more_than_five_minutes_rides_qty: 1, eligible_rides_qty: 2, observed_rides_qty: 2 },
		},
		{
			agency_id: 'agency-b',
			availability: true,
			trend: [{ delay_10_to_20_minutes_rides_qty: 1, delay_5_to_10_minutes_rides_qty: 1, delay_more_than_20_minutes_rides_qty: 0, delayed_more_than_five_minutes_pct: 100, interval_start: 1_785_139_200_000, observed_rides_qty: 2 }],
			value: { average_start_delay_minutes: 10, coverage_pct: 100 * 2 / 3, delay_status: 'above_target', delayed_more_than_five_minutes_pct: 100, delayed_more_than_five_minutes_rides_qty: 2, eligible_rides_qty: 3, observed_rides_qty: 2 },
		},
	],
	definition_version: 'departure-delays-v1',
	meta: { ...metricMeta, interval_minutes: 60, target_pct: 10 },
	total: { trend: [], value: null },
});
const selectedDepartureDelays = selectDepartureDelayMetrics(departureDelays, ['agency-a', 'agency-b']);

assert.equal(selectedDepartureDelays.total.value?.average_start_delay_minutes, 7.5);
assert.equal(selectedDepartureDelays.total.value?.coverage_pct, 80);
assert.equal(selectedDepartureDelays.total.value?.delayed_more_than_five_minutes_rides_qty, 3);

const vkmExecution = VkmExecutionMetricsSchema.parse({
	agencies: [
		{
			agency_id: 'agency-a',
			availability: true,
			trend: [{ executed_distance_km: 9, execution_pct: 90, interval_start: 1_785_139_200_000, scheduled_distance_km: 10 }],
			value: { distance_to_plan_km: 1, executed_distance_km: 9, execution_pct: 90, execution_status: 'below_target', scheduled_distance_km: 10 },
		},
		{
			agency_id: 'agency-b',
			availability: true,
			trend: [{ executed_distance_km: 20, execution_pct: 100, interval_start: 1_785_139_200_000, scheduled_distance_km: 20 }],
			value: { distance_to_plan_km: 0, executed_distance_km: 20, execution_pct: 100, execution_status: 'within_target', scheduled_distance_km: 20 },
		},
	],
	definition_version: 'vkm-execution-v1',
	meta: { ...metricMeta, interval_minutes: 120 },
	total: { trend: [], value: null },
});
const selectedVkmExecution = selectVkmExecutionMetrics(vkmExecution, ['agency-a', 'agency-b']);

assert.equal(selectedVkmExecution.total.value?.scheduled_distance_km, 30);
assert.equal(selectedVkmExecution.total.value?.executed_distance_km, 29);
assert.equal(selectedVkmExecution.total.value?.execution_pct, 29 / 30 * 100);

console.log('API ride metric selection tests passed.');
