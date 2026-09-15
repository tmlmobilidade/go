'use client';

/* * */

import { useMetricData, type UseMetricDataReturnType } from '@/hooks/use-metric-data';
import { MetricsRoutes } from '@/routes';
import { type TopLines30DayPerformance } from '@tmlmobilidade/go-types-performance';

/* * */

export type UseTopLinesPerformanceDataReturnType = UseMetricDataReturnType<TopLines30DayPerformance>;

/* * */

/**
 * Fetches the top lines 30-day performance metric from the performance API.
 */
export function useTopLinesPerformanceData(): UseTopLinesPerformanceDataReturnType {
	return useMetricData<TopLines30DayPerformance>(MetricsRoutes.TOP_LINES_30DAY_PERFORMANCE);
}
