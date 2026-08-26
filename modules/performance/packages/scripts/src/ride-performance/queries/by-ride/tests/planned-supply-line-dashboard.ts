/* * */

import { normalizePlannedSupplyLineDashboard } from '@/ride-performance/queries/by-ride/planned-supply-line-dashboard.js';
import assert from 'node:assert/strict';
import test from 'node:test';

/* * */

test('normalizes planned supply into totals, profiles, heatmap, and pattern comparisons', () => {
	const current = [
		{ departure_minutes: [360, 390, 420], operational_date: 20260706, pattern_id: 'outbound', scheduled_distance_m: 66_000, scheduled_rides_qty: 3 },
		{ departure_minutes: [375, 405], operational_date: 20260706, pattern_id: 'inbound', scheduled_distance_m: 44_000, scheduled_rides_qty: 2 },
		{ departure_minutes: [360, 420], operational_date: 20260711, pattern_id: 'outbound', scheduled_distance_m: 44_000, scheduled_rides_qty: 2 },
	];
	const comparison = [
		{ departure_minutes: [360, 420], operational_date: 20260608, pattern_id: 'outbound', scheduled_distance_m: 44_000, scheduled_rides_qty: 2 },
		{ departure_minutes: [375, 435], operational_date: 20260608, pattern_id: 'inbound', scheduled_distance_m: 44_000, scheduled_rides_qty: 2 },
	];
	const result = normalizePlannedSupplyLineDashboard(current, comparison);

	assert.equal(result.current.scheduled_rides_qty, 7);
	assert.equal(result.current.scheduled_vehicle_km, 154);
	assert.equal(result.current.active_days_qty, 2);
	assert.equal(result.evolution.current.length, 2);
	assert.equal(result.patterns[0].id, 'outbound');
	assert.equal(result.patterns[0].current_rides_qty, 5);
	assert.ok(result.heatmap.some(cell => cell.day_of_week === 1 && cell.hour === 6));
	assert.equal(result.day_profiles.find(item => item.day_type === 'weekday')?.median_headway_minutes, 30);
});

test('preserves departures after midnight inside the operational day', () => {
	const result = normalizePlannedSupplyLineDashboard([
		{ departure_minutes: [1500], operational_date: 20260706, pattern_id: 'night', scheduled_distance_m: 20_000, scheduled_rides_qty: 1 },
	], []);

	assert.ok(result.heatmap.some(cell => cell.hour === 25));
});
