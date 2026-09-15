'use client';

/* * */

import { useMetricData, type UseMetricDataReturnType } from '@/hooks/use-metric-data';
import { MetricsRoutes } from '@/routes';
import { type RealtimeDemand } from '@tmlmobilidade/go-types-performance';

/* * */

export type UseRealtimeDemandDataReturnType = UseMetricDataReturnType<RealtimeDemand>;

/* * */

/**
 * Fetches the realtime demand metric from the performance API.
 */
export function useRealtimeDemandData(): UseRealtimeDemandDataReturnType {
	return useMetricData<RealtimeDemand>(MetricsRoutes.REALTIME_DEMAND);
}
