import { createPerformanceCsvExportConfig, createPerformanceCsvExportRows } from '@/components/common/PerformanceCsvExportButton/performance-csv-export';
import assert from 'node:assert/strict';

/* * */

const data = createPerformanceCsvExportRows([
	{
		dimensions: { period_role: 'current' },
		rows: [{ operational_date: 20260820, rides: 10 }],
	},
	{
		dimensions: { period_role: 'comparison' },
		rows: [{ operational_date: 20260813, rides: 8, vehicle_km: 120 }],
	},
]);

assert.deepEqual(data, [
	{ operational_date: 20260820, period_role: 'current', rides: 10 },
	{ operational_date: 20260813, period_role: 'comparison', rides: 8, vehicle_km: 120 },
]);

const config = createPerformanceCsvExportConfig({
	comparisonMode: 'previous-period',
	data,
	filenameParts: ['line-100'],
	metadata: {
		current_period_start: 'must-not-override-global-period',
		line_code: '100',
		line_id: undefined,
	},
	operatorIds: ['operator-a', 'operator-b'],
	periodSelection: { endDate: '2026-08-20', preset: 'custom', startDate: '2026-08-14' },
	visualizationId: 'supply-evolution',
});

assert.deepEqual(config.columnHeaders, [
	{ displayLabel: 'operational_date', key: 'operational_date' },
	{ displayLabel: 'rides', key: 'rides' },
	{ displayLabel: 'period_role', key: 'period_role' },
	{ displayLabel: 'vehicle_km', key: 'vehicle_km' },
]);
assert.equal(config.filename, 'performance-line-100-supply-evolution-2026-08-14-2026-08-20');
assert.deepEqual(config.metadata, [
	{ label: 'comparison_mode', value: 'previous-period' },
	{ label: 'comparison_period_end', value: '2026-08-13' },
	{ label: 'comparison_period_start', value: '2026-08-07' },
	{ label: 'current_period_end', value: '2026-08-20' },
	{ label: 'current_period_start', value: '2026-08-14' },
	{ label: 'operator_ids', value: 'operator-a,operator-b' },
	{ label: 'period_preset', value: 'custom' },
	{ label: 'line_code', value: '100' },
]);
