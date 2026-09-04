/* * */

import { type PerformancePeriods } from '@/utils/performance-periods';
import { API_ROUTES } from '@tmlmobilidade/consts';

/* * */

interface CreateNetworkLineRequestUrlsOptions {
	metricAgencyIds: string[]
	periods: PerformancePeriods
}

/* * */

export function createNetworkLineRequestUrls({ metricAgencyIds, periods }: CreateNetworkLineRequestUrlsOptions) {
	const networkQuery = new URLSearchParams({
		end_date: periods.current.endDate,
		start_date: periods.current.startDate,
	});
	const ridePerformanceQuery = new URLSearchParams({
		comparison_end_date: periods.comparison.endDate,
		comparison_start_date: periods.comparison.startDate,
		current_end_date: periods.current.endDate,
		current_start_date: periods.current.startDate,
		exclude_unknown: 'true',
	});

	metricAgencyIds.forEach((agencyId) => {
		networkQuery.append('agency_ids', agencyId);
		ridePerformanceQuery.append('agency_ids', agencyId);
	});

	return {
		lines: `${API_ROUTES.performance.NETWORK_LINES}?${networkQuery.toString()}`,
		ridePerformance: `${API_ROUTES.performance.RIDE_PERFORMANCE_BY_LINE}?${ridePerformanceQuery.toString()}`,
	};
}
