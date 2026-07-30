/* * */

import { CM_AGENCY_IDS } from '@/agencies/cm/constants';
import { createVideowallMockMetrics } from '@/mocks/videowall/create-mock-metrics';
import {
	PassengerDemandMetricsSchema,
	VideowallMetricsSchema,
} from '@tmlmobilidade/go-types-public-info';
import assert from 'node:assert/strict';

/* * */

const excellent = createVideowallMockMetrics(CM_AGENCY_IDS, 'excellent');
const regular = createVideowallMockMetrics(CM_AGENCY_IDS, 'regular');
const bad = createVideowallMockMetrics(CM_AGENCY_IDS, 'bad');
const unavailable = createVideowallMockMetrics(CM_AGENCY_IDS, 'unavailable');

for (const fixture of [excellent, regular, bad, unavailable]) {
	PassengerDemandMetricsSchema.parse(fixture.demand_metrics);
	VideowallMetricsSchema.parse(fixture.metrics);
}

assert.equal(excellent.demand_metrics.total.value?.deviation_status, 'above_typical');
assert.equal(regular.demand_metrics.total.value?.deviation_status, 'typical');
assert.equal(bad.demand_metrics.total.value?.deviation_status, 'below_typical');
assert.equal(unavailable.demand_metrics.total.value, null);
assert.equal(unavailable.metrics.total.service, null);
assert.equal(unavailable.metrics.meta.status, 'partial');
assert.equal(regular.demand_metrics.total.trend.length, 49);
assert.ok(
	(excellent.metrics.total.service?.delays.average_start_delay_minutes ?? Infinity)
	< (bad.metrics.total.service?.delays.average_start_delay_minutes ?? 0),
);
