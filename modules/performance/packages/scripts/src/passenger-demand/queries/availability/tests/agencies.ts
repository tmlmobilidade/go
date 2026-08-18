/* * */

import assert from 'node:assert/strict';
import test from 'node:test';

import { AVAILABLE_PASSENGER_DEMAND_AGENCIES_QUERY } from '../agencies.js';

/* * */

test('finds agencies represented in daily and five-minute passenger-demand facts', () => {
	assert.match(AVAILABLE_PASSENGER_DEMAND_AGENCIES_QUERY, /passenger_demand_by_dimensions_by_day/);
	assert.match(AVAILABLE_PASSENGER_DEMAND_AGENCIES_QUERY, /passenger_demand_by_dimensions_by_5_minutes/);
	assert.match(AVAILABLE_PASSENGER_DEMAND_AGENCIES_QUERY, /GROUP BY agency_id/);
	assert.match(AVAILABLE_PASSENGER_DEMAND_AGENCIES_QUERY, /ORDER BY agency_id/);
});
