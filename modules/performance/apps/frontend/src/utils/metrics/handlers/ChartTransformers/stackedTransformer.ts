/**
 * Stacked Chart Transformer
 * Handles stacked bar/area charts with breakdown by time
 */

import type { RawMetricData, StackedResult } from '@/utils/metrics/types';

import { TFunction } from 'i18next';

import {
	calculateBreakdownTotals,
	extractBreakdowns,
	formatDayDetailed,
	formatDayShort,
	formatMonth,
	getTopBreakdowns,
} from '../../utils';

/* * */

export function transformToStacked(
	data: RawMetricData[],
	breakdownKey: string,
	topN: number,
	timeView: 'annual' | 'daily' | 'monthly',
	t?: TFunction,
	quantityKey = 'qty',
): StackedResult {
	// Get top breakdowns and aggregate them
	const breakdownTotals = calculateBreakdownTotals(data, breakdownKey, quantityKey);
	const { otherItems, topItems } = getTopBreakdowns(breakdownTotals, topN);

	// Aggregate by date with breakdown grouping
	const dateMap: Record<string, Record<string, number | string | undefined>> = {};
	let totalSum = 0;

	for (const item of data) {
		Object.entries(item.data).forEach(([date, dayData]) => {
			if (!dateMap[date]) {
				// Create base fields based on timeView
				switch (timeView) {
					case 'annual':
						dateMap[date] = { year: date };
						break;
					case 'daily':
						dateMap[date] = {
							day_detailed: formatDayDetailed({
								day_group: date,
								day_type: dayData.day_type,
								holiday: dayData.holiday,
								notes: dayData.notes,
							}, t),
							day_short: formatDayShort({ day_group: date }, t),
						};
						break;
					case 'monthly':
						dateMap[date] = { month: formatMonth(date) };
						break;
				}
			}

			const breakdowns = extractBreakdowns(dayData, item, breakdownKey, quantityKey);
			Object.entries(breakdowns).forEach(([key, qty]) => {
				const aggregationKey = topItems.includes(key) ? key : 'Outros';
				const currentQty = (dateMap[date][aggregationKey] as number) || 0;
				dateMap[date][aggregationKey] = currentQty + qty;
				totalSum += qty;
			});
		});
	}

	// Create final series list
	const finalSeries = [...topItems];
	if (otherItems.length > 0) {
		finalSeries.push('Outros');
	}

	// Transform to chart format
	const chartData = Object.entries(dateMap)
		.sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
		.map(([, dayData]) => {
			// Calculate total for this day
			const dayTotal = Object.entries(dayData)
				.filter(([key]) => finalSeries.includes(key))
				.reduce((sum, [, qty]) => sum + ((qty as number) || 0), 0);

			return {
				...dayData,
				total_qty: dayTotal,
			};
		});

	return { chart: chartData, series: finalSeries, sum: totalSum };
}
