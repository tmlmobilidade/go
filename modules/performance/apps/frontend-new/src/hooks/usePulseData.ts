'use client';

/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { getCurrentPeriod } from '@/utils/performance-periods';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandBaselineComparison, type RidePerformanceBaselineComparison } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function usePulseData() {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const filtersContext = usePerformanceFiltersContext();
	const currentPeriod = getCurrentPeriod(filtersContext.filters.period.value);
	const selectedAgencies = useMemo(() => {
		const selectedIds = new Set(filtersContext.filters.operator.values);
		return agenciesContext.data.agencies.filter(agency => selectedIds.has(agency._id));
	}, [agenciesContext.data.agencies, filtersContext.filters.operator.values]);
	const selectedMetricAgencyIds = useMemo(
		() => selectedAgencies.flatMap(agency => agency.metric_ids),
		[selectedAgencies],
	);
	const demandQuery = new URLSearchParams({
		exclude_unknown: 'true',
		operational_date: currentPeriod.startDate,
	});
	const ridePerformanceQuery = new URLSearchParams({
		exclude_unknown: 'true',
		operational_date: currentPeriod.startDate,
	});
	selectedMetricAgencyIds.forEach(agencyId => demandQuery.append('agency_ids', agencyId));
	selectedMetricAgencyIds.forEach(agencyId => ridePerformanceQuery.append('agency_ids', agencyId));

	//
	// B. Fetch data

	const demandRequest = useSWR<PassengerDemandBaselineComparison, Error>(
		agenciesContext.flags.is_loading ? null : `${API_ROUTES.performance.PASSENGER_DEMAND_BASELINE_COMPARISON}?${demandQuery.toString()}`,
	);
	const ridePerformanceRequest = useSWR<RidePerformanceBaselineComparison, Error>(
		agenciesContext.flags.is_loading ? null : `${API_ROUTES.performance.RIDE_PERFORMANCE_BASELINE_COMPARISON}?${ridePerformanceQuery.toString()}`,
	);

	//
	// C. Return data

	return {
		data: {
			demand: demandRequest.data,
			operational: ridePerformanceRequest.data,
		},
		flags: {
			has_demand_error: !!demandRequest.error,
			has_operational_error: !!ridePerformanceRequest.error,
			is_loading: agenciesContext.flags.is_loading || demandRequest.isLoading || ridePerformanceRequest.isLoading,
		},
		meta: {
			operationalDate: currentPeriod.startDate,
		},
	};

	//
}
