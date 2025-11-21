/* * */

import type { DailyDataPoint, DemandMetricItem, MonthlyDataPoint, TimeSeriesResult, YearlyDataPoint } from '@/utils/metrics/types';

import { extractTotalQuantity, formatDayDetailed, formatDayShort, formatMonth } from '@/utils/metrics/utils';
import { useTranslations } from 'next-intl';

/* * */

/**
 * Transform to simple time series (line/bar chart)
 */
export function transformToTimeSeries(data: DemandMetricItem[], timeView: 'annual' | 'daily' | 'monthly', t?: ReturnType<typeof useTranslations>): TimeSeriesResult {
	const dateMap: Record<string, DailyDataPoint | MonthlyDataPoint | YearlyDataPoint> = {};
	let totalSum = 0;

	for (const item of data) {
		Object.entries(item.data).forEach(([date, dayData]) => {
			const qty = extractTotalQuantity(dayData);

			if (!dateMap[date]) {
				// Create different formats based on timeView
				switch (timeView) {
					case 'annual':
						dateMap[date] = {
							qty: 0,
							year: date,
						} as YearlyDataPoint;
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
							qty: 0,
						} as DailyDataPoint;
						break;
					case 'monthly':
						dateMap[date] = {
							month: formatMonth(date),
							qty: 0,
						} as MonthlyDataPoint;
						break;
				}
			}

			dateMap[date].qty += qty;
			totalSum += qty;
		});
	}

	const chartData = Object.entries(dateMap)
		.sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
		.map(([, data]) => data);

	return {
		chart: chartData as DailyDataPoint[] | MonthlyDataPoint[] | YearlyDataPoint[],
		sum: totalSum,
	};
}
