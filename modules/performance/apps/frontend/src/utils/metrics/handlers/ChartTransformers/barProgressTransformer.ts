import type { RawMetricData } from '@/utils/metrics/types';

import { useTranslations } from 'next-intl';

import { ProgressBarResult } from '../../types/chartResults';
import {
	formatDayDetailed,
	formatDayShort,
	formatMonth,
} from '../../utils';

/* * */

export function transformToProgressBar(
	data: RawMetricData[],
	totalKey: string, // e.g. "scheduled_rides"
	achievedKey: string, // e.g. "accomplished_rides"
	timeView: 'annual' | 'daily' | 'monthly',
	t?: ReturnType<typeof useTranslations>,
): ProgressBarResult {
	const dateMap: Record<string, Record<string, number | string>> = {};
	let achievedSum = 0;

	for (const item of data) {
		Object.entries(item.data).forEach(([date, dayData]) => {
			if (!dateMap[date]) {
				// Include the same date formatting logic as stacked
				switch (timeView) {
					case 'annual':
						dateMap[date] = { year: date };
						break;

					case 'daily':
						dateMap[date] = {
							day_detailed: formatDayDetailed(
								{
									day_group: date,
									day_type: dayData.day_type,
									holiday: dayData.holiday,
									notes: dayData.notes,
								},
								t,
							),
							day_short: formatDayShort({ day_group: date }, t),
						};
						break;

					case 'monthly':
						dateMap[date] = { month: formatMonth(date), month_index: new Date(date).getMonth() };
						break;
				}
			}

			// Retrieve values
			const totalValue = (dayData)[totalKey] as number ?? 0;
			const achievedValue = (dayData)[achievedKey] as number ?? 0;

			const currentTotal = (dateMap[date].total as number) || 0;
			const currentAchieved = (dateMap[date].achieved as number) || 0;

			dateMap[date].total = currentTotal + totalValue;
			dateMap[date].achieved = currentAchieved + achievedValue;

			achievedSum += achievedValue;
		});
	}

	// Final chart data: compute percentage per day
	const chart = Object.entries(dateMap)
		.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
		.map(([, row]) => {
			const total = (row.total as number) || 0;
			const achieved = (row.achieved as number) || 0;
			const percentage = total > 0 ? (achieved / total) * 100 : 0;

			return {
				...row,
				achieved,
				percentage,
				total,
			};
		});

	return {
		chart,
		series: ['total', 'achieved'],
		sum: achievedSum,
	};
}
