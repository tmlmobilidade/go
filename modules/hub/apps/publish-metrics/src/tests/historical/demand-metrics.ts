/* * */

import { buildDemandMetricsByEntity, getDemandMetricTimeGrain } from '@/helpers/historical/demand-metrics.js';
import { hubHistoricalDemandByLineMetricsCacheKey, hubHistoricalDemandByPatternMetricsCacheKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { DemandByLineMetricsByTimeGrainSchema, DemandByLineMetricSchema } from '@tmlmobilidade/go-types-performance';
import assert from 'node:assert/strict';

/* * */

const generatedAt = new Date('2026-08-07T12:00:00.000Z');
const metrics = DemandByLineMetricSchema.array().parse([
	{
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
		metric: 'demand_by_line_by_day',
		properties: { line_id: '1201' },
	},
	{
		data: { '2026-08': { qty: 200 } },
		generated_at: generatedAt,
		metric: 'demand_by_line_by_month',
		properties: { line_id: '1201' },
	},
	{
		data: { 2026: { qty: 300 } },
		generated_at: generatedAt,
		metric: 'demand_by_line_by_year',
		properties: { line_id: '1201' },
	},
]);

const metricsByLine = buildDemandMetricsByEntity({
	getEntityId: metric => metric.properties.line_id,
	getTimeGrain: metric => getDemandMetricTimeGrain(metric.metric),
	metrics,
	parse: value => DemandByLineMetricsByTimeGrainSchema.parse(value),
});
const lineMetrics = metricsByLine.get('1201');

assert.equal(lineMetrics?.day.data['2026-08-07']?.qty, 100);
assert.equal(lineMetrics?.month.data['2026-08']?.qty, 200);
assert.equal(lineMetrics?.year.data['2026']?.qty, 300);
assert.equal(
	hubHistoricalDemandByLineMetricsCacheKey('1201'),
	'hub:v2:metrics:historical:demand-by-line:1201:json',
);
assert.equal(
	hubHistoricalDemandByPatternMetricsCacheKey('1201_0_1'),
	'hub:v2:metrics:historical:demand-by-pattern:1201_0_1:json',
);
assert.throws(() => buildDemandMetricsByEntity({
	getEntityId: metric => metric.properties.line_id,
	getTimeGrain: metric => getDemandMetricTimeGrain(metric.metric),
	metrics: metrics.slice(0, 2),
	parse: value => DemandByLineMetricsByTimeGrainSchema.parse(value),
}));

console.log('Historical demand metric publication tests passed.');
