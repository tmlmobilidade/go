/* * */

import type { DemandMetricItem, MetricTransformOptions, TransformResult } from '../../types';

import { getLatestTimestamp } from '../../utils';
import { transformToPie } from './pieTransformer';
import { transformToStacked } from './stackedTransformer';
import { transformToTimeSeries } from './timeSeriesTransformer';

/* * */

/**
 * Filter metric data by agency IDs
 */
function filterDataByAgencies(data: DemandMetricItem[], agencyIds?: string[]): DemandMetricItem[] {
	if (!agencyIds?.length) {
		return data;
	}

	return data.filter((item) => {
		// Check if the item has agency information in properties
		const agencyId = item.properties?.agency_id || item.properties?.operator_id;

		// If no agency property found, include the item (assume it's aggregated data)
		if (!agencyId) {
			return true;
		}

		// Include only items that match the specified agency IDs
		return agencyIds.includes(agencyId);
	});
}

export function transformDemandMetric(data: DemandMetricItem[], options: MetricTransformOptions): TransformResult {
	//

	const { agencyIds, chartType, t, timeView, topN = 4 } = options;

	// Validate breakdown key requirements for different chart types
	if ((chartType === 'pie' || chartType === 'stacked') && !options.breakdownKey) {
		throw new Error(`Breakdown key is required for ${chartType} chart type`);
	}

	// Apply client-side agency filtering first
	const filteredData = filterDataByAgencies(data, agencyIds);

	if (!filteredData?.length) {
		const emptyResult = { chart: [], sum: 0 };
		return chartType === 'stacked'
			? { all: { ...emptyResult, series: [] }, lastUpdated: null }
			: { all: emptyResult, lastUpdated: null };
	}

	const lastUpdated = getLatestTimestamp(filteredData);

	switch (chartType) {
		case 'pie':
			return { all: transformToPie(filteredData, options.breakdownKey, topN), lastUpdated };
		case 'stacked':
			return { all: transformToStacked(filteredData, options.breakdownKey, topN, timeView, t), lastUpdated };
		case 'timeseries':
			return { all: transformToTimeSeries(filteredData, timeView, t), lastUpdated };
		default:
			throw new Error(`Unsupported chart type: ${chartType}`);
	}
}
