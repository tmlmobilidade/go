/* * */

import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPassengerDemandLineDashboardQueries } from '../line-dashboard.js';

/* * */

test('builds a line-scoped dashboard query set for all demand lenses', () => {
	const result = buildPassengerDemandLineDashboardQueries({
		agency_id: '41',
		comparison_period: { end_date: 20260731, start_date: 20260701 },
		current_period: { end_date: 20260831, start_date: 20260801 },
		line_id: '4701',
		record_period: { end_date: 20260831, start_date: 20250901 },
	});

	assert.match(result.categoryQuery, /GROUP BY category/);
	assert.match(result.productQuery, /GROUP BY product_id/);
	assert.match(result.patternQuery, /GROUP BY pattern_id/);
	assert.match(result.stopQuery, /passenger_demand_by_dimensions_by_5_minutes/);
	assert.match(result.productivityQuery, /combined_executed_distance_m/);
	assert.match(result.recordQuery, /GROUP BY operational_date/);
	assert.equal(result.breakdownParams[2], '41');
	assert.equal(result.breakdownParams[3], '4701');
});
