/* * */

import { createDemoLineDemandDashboardData, createDemoLineDetailData, createDemoLineSupplyData, createDemoNetworkLines, DEMO_PERIOD_SELECTION } from '@/data/demo-performance';
import { getPerformancePeriods } from '@/utils/performance-comparisons';
import assert from 'node:assert/strict';

/* * */

const periods = getPerformancePeriods(
	DEMO_PERIOD_SELECTION,
	'previous-period',
	new Date('2026-08-24T12:00:00Z'),
);
const lines = createDemoNetworkLines(periods);
const refreshedLines = createDemoNetworkLines(periods, 1);

assert.equal(lines.length, 5);
assert.equal(new Set(lines.map(line => line._id)).size, 5);
assert.ok(lines.every(line => line.validations !== null && line.validations > 0));
assert.ok(lines.every(line => line.service !== null && line.delays !== null && line.advances !== null));
assert.notEqual(refreshedLines[0].validations, lines[0].validations);

const detail = createDemoLineDetailData(lines[0]._id, periods);
assert.ok(detail);
assert.equal(detail.points.length, 31);
assert.equal(detail.operationalPoints.length, 31);
assert.equal(detail.hourlyDemandPoints.length, 31 * 19);
assert.equal(detail.operationalHeatmap.length, 7 * 19);
assert.equal(detail.demandByPatternCode.size, 2);
assert.equal(detail.operationalByPatternCode.size, 2);

const demandDashboard = createDemoLineDemandDashboardData(encodeURIComponent(lines[0]._id), periods);
assert.ok(demandDashboard);
assert.equal(demandDashboard.dashboard.records.length, 3);
assert.equal(demandDashboard.dashboard.composition.categories.length, 3);
assert.equal(demandDashboard.dashboard.composition.products.length, 4);
assert.equal(demandDashboard.dashboard.contributions.patterns.length, 2);
assert.equal(demandDashboard.dashboard.contributions.stops.length, 4);
assert.ok(demandDashboard.dashboard.productivity.current.validations_per_operated_ride);

const lineSupply = createDemoLineSupplyData(encodeURIComponent(lines[0]._id), periods);
const refreshedLineSupply = createDemoLineSupplyData(encodeURIComponent(lines[0]._id), periods, 1);
assert.ok(lineSupply);
assert.ok(refreshedLineSupply);
assert.equal(lineSupply.dashboard.evolution.current.length, 31);
assert.equal(lineSupply.dashboard.day_profiles.length, 3);
assert.equal(lineSupply.dashboard.heatmap.length, 7 * 21);
assert.equal(lineSupply.dashboard.patterns.length, 2);
assert.ok(lineSupply.dashboard.current.scheduled_vehicle_km > 0);
assert.notEqual(refreshedLineSupply.dashboard.current.scheduled_rides_qty, lineSupply.dashboard.current.scheduled_rides_qty);
