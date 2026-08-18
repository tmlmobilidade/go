/* * */

import { DemandByLineQueryInputSchema } from '@tmlmobilidade/go-types-performance';
import assert from 'node:assert/strict';

import { buildDailyPassengerDemandByLineMetrics, buildDailyPassengerDemandOverTimeByLineQuery } from '../demand-over-time-by-line.js';

/* * */

const dailyQuery = buildDailyPassengerDemandOverTimeByLineQuery(DemandByLineQueryInputSchema.parse({
	end_date: 20260807,
	line_ids: ['1201', '1202'],
	start_date: 20260801,
	time_grain: 'day',
}));

assert.match(dailyQuery.query, /operational_date AS period/);
assert.match(dailyQuery.query, /line_id IN \$2/);
assert.match(dailyQuery.query, /operational_date >= \$3/);
assert.match(dailyQuery.query, /operational_date <= \$4/);
assert.deepEqual(dailyQuery.params, {
	1: 'passenger-demand-v2',
	2: ['1201', '1202'],
	3: 20260801,
	4: 20260807,
});

const unfilteredYearlyQuery = buildDailyPassengerDemandOverTimeByLineQuery(DemandByLineQueryInputSchema.parse({
	time_grain: 'year',
}));

assert.doesNotMatch(unfilteredYearlyQuery.query, /line_id IN/);
assert.deepEqual(unfilteredYearlyQuery.params, {
	1: 'passenger-demand-v2',
});

const generatedAt = new Date('2026-08-07T12:00:00.000Z');
const dailyMetrics = buildDailyPassengerDemandByLineMetrics(
	[
		{ line_id: '1201', period: 20260806, qty: '120' },
		{ line_id: '1201', period: 20260807, qty: 130 },
	],
	'day',
	generatedAt,
);

assert.deepEqual(dailyMetrics[0], {
	data: {
		'2026-08-06': {
			day_type: '1',
			holiday: '0',
			notes: null,
			period: '3',
			qty: 120,
		},
		'2026-08-07': {
			day_type: '1',
			holiday: '0',
			notes: null,
			period: '3',
			qty: 130,
		},
	},
	description: 'Aggregated passenger demand for line 1201',
	generated_at: generatedAt,
	metric: 'demand_by_line_by_day',
	properties: { line_id: '1201' },
});

console.log('Demand-by-line query tests passed.');
