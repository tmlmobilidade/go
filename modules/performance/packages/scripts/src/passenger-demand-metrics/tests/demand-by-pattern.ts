/* * */

import { buildDemandByPatternMetrics, buildDemandByPatternQuery } from '@/passenger-demand-metrics/demand-by-pattern.js';
import { DemandByPatternQueryInputSchema } from '@tmlmobilidade/go-types-performance';
import assert from 'node:assert/strict';

/* * */

const monthlyQuery = buildDemandByPatternQuery(DemandByPatternQueryInputSchema.parse({
	end_date: 20261231,
	pattern_ids: ['1201_0_1'],
	time_grain: 'month',
}));

assert.match(monthlyQuery.query, /intDiv\(operational_date, 100\) AS period/);
assert.match(monthlyQuery.query, /pattern_id IN \$2/);
assert.match(monthlyQuery.query, /operational_date <= \$3/);
assert.deepEqual(monthlyQuery.params, {
	1: 'passenger-demand-v2',
	2: ['1201_0_1'],
	3: 20261231,
});

const unfilteredDailyQuery = buildDemandByPatternQuery(DemandByPatternQueryInputSchema.parse({
	time_grain: 'day',
}));

assert.doesNotMatch(unfilteredDailyQuery.query, /pattern_id IN/);
assert.deepEqual(unfilteredDailyQuery.params, {
	1: 'passenger-demand-v2',
});

const generatedAt = new Date('2026-08-07T12:00:00.000Z');
const yearlyMetrics = buildDemandByPatternMetrics(
	[
		{ pattern_id: '1201_0_1', period: '2025', qty: '500' },
		{ pattern_id: '1201_0_1', period: 2026, qty: 600 },
	],
	'year',
	generatedAt,
);

assert.deepEqual(yearlyMetrics[0], {
	data: {
		2025: { qty: 500 },
		2026: { qty: 600 },
	},
	description: 'Aggregated passenger demand for pattern 1201_0_1',
	generated_at: generatedAt,
	metric: 'demand_by_pattern_by_year',
	properties: { pattern_id: '1201_0_1' },
});

console.log('Demand-by-pattern query tests passed.');
