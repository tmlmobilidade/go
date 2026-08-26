/* * */

import { type PerformancePeriods } from '@/utils/performance-periods';
import { API_ROUTES } from '@tmlmobilidade/consts';

/* * */

interface CreateNetworkLineRequestUrlsOptions {
	metricAgencyIds: string[]
	periods: PerformancePeriods
}

/* * */

function appendAgencyIds(query: URLSearchParams, agencyIds: string[]) {
	agencyIds.forEach(agencyId => query.append('agency_ids', agencyId));
}

export function createNetworkLineRequestUrls({ metricAgencyIds, periods }: CreateNetworkLineRequestUrlsOptions) {
	const demandQuery = new URLSearchParams({
		end_date: periods.current.endDate,
		exclude_unknown: 'true',
		limit: '1000',
		start_date: periods.current.startDate,
	});
	const comparisonDemandQuery = new URLSearchParams({
		end_date: periods.comparison.endDate,
		exclude_unknown: 'true',
		limit: '1000',
		start_date: periods.comparison.startDate,
	});
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

	appendAgencyIds(demandQuery, metricAgencyIds);
	appendAgencyIds(comparisonDemandQuery, metricAgencyIds);
	appendAgencyIds(networkQuery, metricAgencyIds);
	appendAgencyIds(ridePerformanceQuery, metricAgencyIds);

	return {
		comparisonDemand: `${API_ROUTES.performance.PASSENGER_DEMAND_BY_LINE}?${comparisonDemandQuery.toString()}`,
		demand: `${API_ROUTES.performance.PASSENGER_DEMAND_BY_LINE}?${demandQuery.toString()}`,
		lines: `${API_ROUTES.performance.NETWORK_LINES}?${networkQuery.toString()}`,
		ridePerformance: `${API_ROUTES.performance.RIDE_PERFORMANCE_BY_LINE}?${ridePerformanceQuery.toString()}`,
	};
}
