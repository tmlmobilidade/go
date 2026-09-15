'use client';

/* * */

import { useMetricData, type UseMetricDataReturnType } from '@/hooks/use-metric-data';
import { MetricsRoutes } from '@/routes';
import { type RealtimeServiceCompliance } from '@tmlmobilidade/go-types-performance';

/* * */

export type UseRealtimeServiceComplianceDataReturnType = UseMetricDataReturnType<RealtimeServiceCompliance>;

/* * */

/**
 * Fetches the realtime service compliance metric from the performance API.
 */
export function useRealtimeServiceComplianceData(): UseRealtimeServiceComplianceDataReturnType {
	return useMetricData<RealtimeServiceCompliance>(MetricsRoutes.REALTIME_SERVICE_COMPLIANCE);
}
