/* * */

import { CM_AGENCY_IDS } from '@/agencies/cm/constants';
import { createVideowallMockMetrics } from '@/mocks/videowall/create-mock-metrics';
import {
	DepartureDelayMetricsSchema,
	PassengerDemandMetricsSchema,
	ServiceComplianceMetricsSchema,
	VkmExecutionMetricsSchema,
} from '@tmlmobilidade/go-types-public-info';
import assert from 'node:assert/strict';

/* * */

const excellent = createVideowallMockMetrics(CM_AGENCY_IDS, 'excellent');
const regular = createVideowallMockMetrics(CM_AGENCY_IDS, 'regular');
const bad = createVideowallMockMetrics(CM_AGENCY_IDS, 'bad');
const unavailable = createVideowallMockMetrics(CM_AGENCY_IDS, 'unavailable');

function getWeekday(operationalDate: number) {
	const value = String(operationalDate);
	return new Date(Date.UTC(
		Number(value.slice(0, 4)),
		Number(value.slice(4, 6)) - 1,
		Number(value.slice(6, 8)),
	)).getUTCDay();
}

for (const fixture of [excellent, regular, bad, unavailable]) {
	DepartureDelayMetricsSchema.parse(fixture.departure_delay_metrics);
	PassengerDemandMetricsSchema.parse(fixture.demand_metrics);
	ServiceComplianceMetricsSchema.parse(fixture.service_compliance_metrics);
	VkmExecutionMetricsSchema.parse(fixture.vkm_execution_metrics);
}

assert.equal(excellent.demand_metrics.total.value?.deviation_status, 'above_typical');
assert.equal(regular.demand_metrics.total.value?.deviation_status, 'typical');
assert.equal(bad.demand_metrics.total.value?.deviation_status, 'below_typical');
assert.equal(unavailable.demand_metrics.total.value, null);
assert.equal(unavailable.departure_delay_metrics.total.value, null);
assert.equal(unavailable.service_compliance_metrics.total.value, null);
assert.equal(unavailable.vkm_execution_metrics.total.value, null);
assert.equal(regular.demand_metrics.total.trend.length, 49);
assert.equal(regular.departure_delay_metrics.meta.interval_minutes, 60);
assert.equal(regular.departure_delay_metrics.meta.target_pct, 10);
assert.equal(regular.departure_delay_metrics.total.trend.length, 13);
assert.equal(regular.departure_delay_metrics.total.value?.delay_status, 'within_target');
assert.equal(bad.departure_delay_metrics.total.value?.delay_status, 'above_target');
assert.equal(regular.service_compliance_metrics.meta.interval_minutes, 120);
assert.equal(regular.service_compliance_metrics.meta.target_pct, 95);
assert.equal(regular.service_compliance_metrics.total.trend.length, 7);
assert.equal(excellent.service_compliance_metrics.total.value?.compliance_status, 'meets_target');
assert.equal(bad.service_compliance_metrics.total.value?.compliance_status, 'below_target');
assert.equal(regular.vkm_execution_metrics.meta.interval_minutes, 120);
assert.equal(regular.vkm_execution_metrics.meta.target_pct, 95);
assert.equal(regular.vkm_execution_metrics.total.trend.length, 7);
assert.equal(regular.vkm_execution_metrics.total.value?.execution_status, 'within_target');
assert.equal(bad.vkm_execution_metrics.total.value?.execution_status, 'below_target');
assert.equal(
	regular.demand_metrics.meta.last_week_operational_date,
	regular.demand_metrics.meta.baseline_operational_dates[0],
);
assert.ok(
	regular.demand_metrics.meta.baseline_operational_dates.every(date =>
		getWeekday(date) === getWeekday(regular.demand_metrics.meta.current_operational_date),
	),
);
assert.ok(
	(excellent.departure_delay_metrics.total.value?.average_start_delay_minutes ?? Infinity)
	< (bad.departure_delay_metrics.total.value?.average_start_delay_minutes ?? 0),
);

const regularDelayedRidesFromTrend = regular.departure_delay_metrics.total.trend.reduce(
	(total, point) => {
		const pointDelayedRidesQty = [
			point.delay_5_to_10_minutes_rides_qty,
			point.delay_10_to_20_minutes_rides_qty,
			point.delay_more_than_20_minutes_rides_qty,
		].reduce((subtotal, quantity) => subtotal + quantity, 0);

		return total + pointDelayedRidesQty;
	},
	0,
);

assert.equal(
	regular.departure_delay_metrics.total.value?.delayed_more_than_five_minutes_rides_qty,
	regularDelayedRidesFromTrend,
);

const regularExecutedDistanceFromTrend = regular.vkm_execution_metrics.total.trend.reduce(
	(total, point) => total + point.executed_distance_km,
	0,
);

assert.equal(
	regular.vkm_execution_metrics.total.value?.executed_distance_km,
	regularExecutedDistanceFromTrend,
);
