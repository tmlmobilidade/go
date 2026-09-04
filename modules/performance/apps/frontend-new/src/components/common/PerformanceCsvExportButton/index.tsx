'use client';

/* * */

import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { CsvExportButton, type CsvExportRow } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { createPerformanceCsvExportConfig, createPerformanceCsvExportRows, type PerformanceCsvExportDataset } from './performance-csv-export';

/* * */

interface PerformanceCsvExportButtonProps {
	datasets: PerformanceCsvExportDataset[]
	disabled?: boolean
	filenameParts?: Array<string | undefined>
	metadata?: CsvExportRow
	scope?: string
	suffix?: string
	visualizationId: string
}

/* * */

const EMPTY_FILENAME_PARTS: Array<string | undefined> = [];
const EMPTY_METADATA: CsvExportRow = {};

/* * */

export function PerformanceCsvExportButton({ datasets, disabled, filenameParts = EMPTY_FILENAME_PARTS, metadata: customMetadata = EMPTY_METADATA, scope = 'performance', suffix, visualizationId }: PerformanceCsvExportButtonProps) {
	//

	//
	// A. Setup variables

	const filtersContext = usePerformanceFiltersContext();
	const comparisonMode = filtersContext.filters.comparison.value;
	const operatorIds = filtersContext.filters.operator.values;
	const periodSelection = filtersContext.filters.period.value;

	//
	// B. Transform data

	const data = useMemo(() => createPerformanceCsvExportRows(datasets), [datasets]);
	const config = useMemo(() => createPerformanceCsvExportConfig({
		comparisonMode,
		data,
		filenameParts,
		metadata: customMetadata,
		operatorIds,
		periodSelection,
		scope,
		suffix,
		visualizationId,
	}), [comparisonMode, customMetadata, data, filenameParts, operatorIds, periodSelection, scope, suffix, visualizationId]);

	//
	// C. Render components

	return <CsvExportButton config={config} data={data} disabled={disabled} />;

	//
}
