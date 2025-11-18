/**
 * Breakdown extraction utilities for different data structures
 */

import type { DemandDataPoint, DemandMetricItem } from '../types';

/**
 * Extract total quantity from a data point
 */
export function extractTotalQuantity(dayData: DemandDataPoint): number {
	return dayData.qty || 0;
}

/**
 * Extract breakdowns from data point and item based on a dynamic breakdown key
 * Handles different data structures automatically
 */
export function extractBreakdowns(dayData: DemandDataPoint, item: DemandMetricItem, breakdownKey: string): Record<string, number> {
	//

	const breakdownValue = item.properties?.[breakdownKey];
	if (breakdownValue) {
		return { [breakdownValue]: dayData.qty || 0 };
	}

	// If breakdown key not found, return total quantity under "unknown" category
	return { unknown: dayData.qty || 0 };
}

/**
 * Calculate breakdown totals across all data and rank them
 */
export function calculateBreakdownTotals(data: DemandMetricItem[], breakdownKey: string): Record<string, number> {
	//

	const totals: Record<string, number> = {};

	for (const item of data) {
		Object.values(item.data).forEach((dayData) => {
			const breakdowns = extractBreakdowns(dayData, item, breakdownKey);
			Object.entries(breakdowns).forEach(([key, qty]) => {
				totals[key] = (totals[key] || 0) + qty;
			});
		});
	}

	return totals;
}

/**
 * Get top N breakdowns, grouping the rest as "Outros"
 */
export function getTopBreakdowns(totals: Record<string, number>, topN: number) {
	//

	const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a);
	const topItems = sorted.slice(0, topN).map(([key]) => key);
	const otherItems = sorted.slice(topN).map(([key]) => key);

	return { otherItems, topItems };
}
