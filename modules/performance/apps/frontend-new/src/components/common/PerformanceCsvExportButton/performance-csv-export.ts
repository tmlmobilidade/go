/* * */

import { getPerformancePeriods } from '@/utils/performance-comparisons';
import { type PerformanceComparison, type PerformancePeriodSelection } from '@/utils/performance-periods';
import { type CsvExportConfig, type CsvExportMetadata, type CsvExportRow } from '@tmlmobilidade/ui';

/* * */

export interface PerformanceCsvExportDataset {
	dimensions?: CsvExportRow
	rows: CsvExportRow[]
}

interface CreatePerformanceCsvExportConfigOptions {
	comparisonMode: PerformanceComparison
	data: CsvExportRow[]
	filenameParts?: Array<string | undefined>
	metadata?: CsvExportRow
	operatorIds: string[]
	periodSelection: PerformancePeriodSelection
	referenceDate?: Date
	scope?: string
	suffix?: string
	visualizationId: string
}

/* * */

function createCsvFilename(parts: Array<string | undefined>): string {
	return parts
		.map(part => (part ?? '').trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, ''))
		.filter(Boolean)
		.join('-')
		.toLowerCase()
		.slice(0, 120);
}

/* * */

export function createPerformanceCsvExportRows(datasets: PerformanceCsvExportDataset[]): CsvExportRow[] {
	return datasets.flatMap(dataset => dataset.rows.map(row => ({
		...row,
		...dataset.dimensions,
	})));
}

export function createPerformanceCsvExportConfig(options: CreatePerformanceCsvExportConfigOptions): CsvExportConfig {
	const periods = getPerformancePeriods(options.periodSelection, options.comparisonMode, options.referenceDate);
	const columnKeys = [...new Set(options.data.flatMap(row => Object.keys(row)))];
	const globalMetadata: CsvExportRow = {
		comparison_mode: options.comparisonMode,
		comparison_period_end: periods.comparison.endDate,
		comparison_period_start: periods.comparison.startDate,
		current_period_end: periods.current.endDate,
		current_period_start: periods.current.startDate,
		operator_ids: options.operatorIds.join(','),
		period_preset: options.periodSelection.preset,
	};
	const metadata: CsvExportMetadata[] = [
		...Object.entries(globalMetadata),
		...Object.entries(options.metadata ?? {}).filter(([label]) => !(label in globalMetadata)),
	]
		.filter(([, value]) => value !== undefined)
		.map(([label, value]) => ({ label, value }));

	return {
		columnHeaders: columnKeys.map(key => ({ displayLabel: key, key })),
		filename: createCsvFilename([
			options.scope ?? 'performance',
			...(options.filenameParts ?? []),
			options.visualizationId,
			options.suffix,
			periods.current.startDate,
			periods.current.endDate,
		]),
		metadata,
	};
}
