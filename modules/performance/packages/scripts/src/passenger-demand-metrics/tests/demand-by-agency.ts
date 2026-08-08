/* * */

import { buildDemandByAgencyMetrics, buildDemandByAgencyQuery } from '@/passenger-demand-metrics/demand-by-agency.js';
import { DemandByAgencyQueryInputSchema } from '@tmlmobilidade/go-types-performance';
import assert from 'node:assert/strict';

/* * */

const dailyQuery = buildDemandByAgencyQuery(DemandByAgencyQueryInputSchema.parse({
	agency_ids: ['41', '42'],
	end_date: 20260807,
	start_date: 20260801,
	time_grain: 'day',
}));

assert.match(dailyQuery.query, /operational_date AS period/);
assert.match(dailyQuery.query, /agency_id IN \$2/);
assert.match(dailyQuery.query, /operational_date >= \$3/);
assert.match(dailyQuery.query, /operational_date <= \$4/);
assert.deepEqual(dailyQuery.params, {
	1: 'passenger-demand-v2',
	2: ['41', '42'],
	3: 20260801,
	4: 20260807,
});

const monthlyQuery = buildDemandByAgencyQuery(DemandByAgencyQueryInputSchema.parse({
	end_date: 20261231,
	time_grain: 'month',
}));

assert.match(monthlyQuery.query, /intDiv\(operational_date, 100\) AS period/);
assert.match(monthlyQuery.query, /operational_date <= \$2/);
assert.doesNotMatch(monthlyQuery.query, /operational_date >=/);
assert.deepEqual(monthlyQuery.params, {
	1: 'passenger-demand-v2',
	2: 20261231,
});

const generatedAt = new Date('2026-08-07T12:00:00.000Z');
const dailyMetrics = buildDemandByAgencyMetrics(
	[
		{ agency_id: '41', period: 20260806, qty: '120' },
		{ agency_id: '41', period: 20260807, qty: 130 },
		{ agency_id: '42', period: 20260807, qty: '75' },
	],
	'day',
	generatedAt,
);

assert.equal(dailyMetrics.length, 2);
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
	description: 'Aggregated passenger demand for agency 41',
	generated_at: generatedAt,
	metric: 'demand_by_agency_by_day',
	properties: { agency_id: '41' },
});

const yearlyMetrics = buildDemandByAgencyMetrics(
	[
		{ agency_id: '41', period: '2025', qty: '500' },
		{ agency_id: '41', period: 2026, qty: 600 },
	],
	'year',
	generatedAt,
);

assert.deepEqual(yearlyMetrics[0]?.data, {
	2025: { qty: 500 },
	2026: { qty: 600 },
});

console.log('Demand-by-agency query tests passed.');
