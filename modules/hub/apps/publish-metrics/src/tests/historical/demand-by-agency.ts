/* * */

import {
	getHistoricalDemandMetricsPublishSlot,
	HISTORICAL_DEMAND_METRICS_PUBLISH_INTERVAL_MS,
} from '@/helpers/historical/demand-metrics.js';
import {
	parseDemandByAgencyMetricsCacheValue,
} from '@/tasks/historical/demand-by-agency.js';
import assert from 'node:assert/strict';

/* * */

const generatedAt = new Date('2026-08-07T12:00:00.000Z');
const metrics = parseDemandByAgencyMetricsCacheValue({
	day: [{
		data: {
			'2026-08-07': {
				day_type: '1',
				holiday: '0',
				notes: null,
				period: '2',
				qty: 100,
			},
		},
		generated_at: generatedAt,
		metric: 'demand_by_agency_by_day',
		properties: { agency_id: 'agency-a' },
	}],
	month: [{
		data: { '2026-08': { qty: 200 } },
		generated_at: generatedAt,
		metric: 'demand_by_agency_by_month',
		properties: { agency_id: 'agency-a' },
	}],
	year: [{
		data: { 2026: { qty: 300 } },
		generated_at: generatedAt,
		metric: 'demand_by_agency_by_year',
		properties: { agency_id: 'agency-a' },
	}],
});

const parsedFromCache = parseDemandByAgencyMetricsCacheValue(
	JSON.parse(JSON.stringify(metrics)),
);

assert.ok(parsedFromCache.day[0]?.generated_at instanceof Date);
assert.equal(parsedFromCache.day[0]?.data['2026-08-07']?.qty, 100);
assert.equal(parsedFromCache.month[0]?.data['2026-08']?.qty, 200);
assert.equal(parsedFromCache.year[0]?.data['2026']?.qty, 300);

const firstSlotStart = getHistoricalDemandMetricsPublishSlot(1_700_000_000_000) * HISTORICAL_DEMAND_METRICS_PUBLISH_INTERVAL_MS;
assert.equal(
	getHistoricalDemandMetricsPublishSlot(firstSlotStart),
	getHistoricalDemandMetricsPublishSlot(firstSlotStart + HISTORICAL_DEMAND_METRICS_PUBLISH_INTERVAL_MS - 1),
);
assert.equal(
	getHistoricalDemandMetricsPublishSlot(firstSlotStart + HISTORICAL_DEMAND_METRICS_PUBLISH_INTERVAL_MS),
	getHistoricalDemandMetricsPublishSlot(firstSlotStart) + 1,
);

console.log('Demand by agency publishing tests passed.');
