'use client';

/* * */

import { useMetricData, type UseMetricDataReturnType } from '@/hooks/use-metric-data';
import { MetricsRoutes } from '@/routes';
import { type TopDemandByAgencyByDayType } from '@tmlmobilidade/go-types-performance';

/* * */

export type UseTopDemandByAgencyByDayTypeDataReturnType = UseMetricDataReturnType<TopDemandByAgencyByDayType>;

/* * */

/**
 * Fetches the top demand by agency by day type metric from the performance API.
 */
export function useTopDemandByAgencyByDayTypeData(): UseTopDemandByAgencyByDayTypeDataReturnType {
	return useMetricData<TopDemandByAgencyByDayType>(MetricsRoutes.TOP_DEMAND_BY_AGENCY_BY_DAY_TYPE);
}
