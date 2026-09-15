'use client';

/* * */

import { useMetricData, type UseMetricDataReturnType } from '@/hooks/use-metric-data';
import { MetricsRoutes } from '@/routes';
import { type TopDemandByAgency } from '@tmlmobilidade/go-types-performance';

/* * */

export type UseTopDemandByAgencyDataReturnType = UseMetricDataReturnType<TopDemandByAgency>;

/* * */

/**
 * Fetches the top demand by agency metric from the performance API.
 */
export function useTopDemandByAgencyData(): UseTopDemandByAgencyDataReturnType {
	return useMetricData<TopDemandByAgency>(MetricsRoutes.TOP_DEMAND_BY_AGENCY);
}
