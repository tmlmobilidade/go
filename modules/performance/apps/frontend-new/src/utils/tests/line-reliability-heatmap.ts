/* * */

import assert from 'node:assert/strict';

import { createDemandHeatmapCells } from '../../components/line-detail/demand/LineDemandHeatmap/metrics';
import { createOperationalHeatmapCells } from '../../components/line-detail/overview/LineOverviewReliabilityHeatmap/metrics';

/* * */

const mondayFive = Date.parse('2026-08-17T04:00:00Z');
const tuesdayTwo = Date.parse('2026-08-18T01:00:00Z');
const tuesdayFour = Date.parse('2026-08-18T03:00:00Z');
const demandCells = createDemandHeatmapCells([
	{ passenger_demand: 10, period: mondayFive },
	{ passenger_demand: 15, period: mondayFive },
	{ passenger_demand: 20, period: tuesdayTwo },
	{ passenger_demand: 30, period: tuesdayFour },
]);

assert.equal(
	demandCells.find(cell => cell.rowId === 'monday' && cell.columnId === '5')?.value,
	25,
);
assert.equal(
	demandCells.find(cell => cell.rowId === 'monday' && cell.columnId === '26')?.value,
	20,
);
assert.equal(
	demandCells.find(cell => cell.rowId === 'tuesday' && cell.columnId === '4')?.value,
	30,
);
assert.equal(demandCells.length, 7 * 24);

const operationalCells = createOperationalHeatmapCells([{
	advanced_rides_qty: 1,
	advances_pct: 10,
	coverage_pct: 100,
	day_of_week: 1,
	delay_eligible_rides_qty: 10,
	delayed_rides_qty: 2,
	delays_pct: 20,
	execution_failure_rides_qty: 1,
	hour: 5,
	observed_start_rides_qty: 10,
	scheduled_rides_qty: 10,
	service_pct: 90,
}], 'service');

assert.deepEqual(operationalCells, [{ columnId: '5', rowId: 'monday', value: 90 }]);

const afterMidnightOperationalCells = createOperationalHeatmapCells([{
	advanced_rides_qty: 1,
	advances_pct: 10,
	coverage_pct: 100,
	day_of_week: 2,
	delay_eligible_rides_qty: 10,
	delayed_rides_qty: 2,
	delays_pct: 20,
	execution_failure_rides_qty: 1,
	hour: 2,
	observed_start_rides_qty: 10,
	scheduled_rides_qty: 10,
	service_pct: 90,
}], 'service');

assert.deepEqual(afterMidnightOperationalCells, [{ columnId: '26', rowId: 'monday', value: 90 }]);
