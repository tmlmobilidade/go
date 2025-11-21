/**
 * Pie Chart Transformer
 * Handles pie charts with breakdown aggregation
 */

import type { DemandMetricItem, PieResult } from '@/utils/metrics/types';

import { calculateBreakdownTotals, generateColors, getTopBreakdowns } from '@/utils/metrics/utils';

/* * */

export function transformToPie(data: DemandMetricItem[], breakdownKey: string, topN = 10): PieResult {
	// Aggregate breakdown totals across all data points
	const breakdownTotals = calculateBreakdownTotals(data, breakdownKey);

	// Get top N breakdowns and calculate others
	const { otherItems, topItems } = getTopBreakdowns(breakdownTotals, topN);

	// Create pie data from top items
	const topItemsWithValues = topItems.map(item => ({
		key: item,
		value: breakdownTotals[item] || 0,
	}));

	// Calculate "Others" total from remaining items
	const othersTotal = otherItems.reduce((sum, item) => sum + (breakdownTotals[item] || 0), 0);

	// Add "Others" to the data if there are other items
	const allItemsWithValues = [...topItemsWithValues];
	if (othersTotal > 0) {
		allItemsWithValues.push({
			key: 'Outros',
			value: othersTotal,
		});
	}

	// Calculate total for percentage calculations
	const totalValue = allItemsWithValues.reduce((sum, item) => sum + item.value, 0);

	// Generate colors for pie slices (including "Others")
	const allKeys = allItemsWithValues.map(item => item.key);
	const colors = generateColors(allKeys);

	// Transform to pie chart format matching PieResult interface
	const chart = allItemsWithValues.map(item => ({
		color: colors[item.key],
		name: item.key,
		value: item.value,
	}));

	return {
		chart,
		sum: totalValue,
	};
}
