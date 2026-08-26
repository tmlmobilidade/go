'use client';

/* * */

import { type PerformancePeriods } from '@/utils/performance-periods';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import useSWR from 'swr';

/* * */

interface UseLineDemandSeriesOptions {
	agencyId: string
	includeComparison?: boolean
	isEnabled: boolean
	lineId: string
	periods: PerformancePeriods
}

/* * */

export function useLineDemandSeries({ agencyId, includeComparison = true, isEnabled, lineId, periods }: UseLineDemandSeriesOptions) {
	//

	//
	// A. Setup variables

	const timeGrain = periods.isSingleDay ? 'hour' : 'day';
	const baseQuery = new URLSearchParams({
		agency_id: agencyId,
		exclude_unknown: 'true',
		line_id: lineId,
		time_grain: timeGrain,
	});
	const currentQuery = new URLSearchParams(baseQuery);
	currentQuery.set('end_date', periods.current.endDate);
	currentQuery.set('start_date', periods.current.startDate);
	const comparisonQuery = new URLSearchParams(baseQuery);
	comparisonQuery.set('end_date', periods.comparison.endDate);
	comparisonQuery.set('start_date', periods.comparison.startDate);
	const hourlyQuery = new URLSearchParams(currentQuery);
	hourlyQuery.set('time_grain', 'hour');

	//
	// B. Fetch data

	const currentRequest = useSWR<PassengerDemandOverTimePoint[], Error>(
		isEnabled ? `${API_ROUTES.performance.PASSENGER_DEMAND_OVER_TIME}?${currentQuery.toString()}` : null,
	);
	const comparisonRequest = useSWR<PassengerDemandOverTimePoint[], Error>(
		isEnabled && includeComparison
			? `${API_ROUTES.performance.PASSENGER_DEMAND_OVER_TIME}?${comparisonQuery.toString()}`
			: null,
	);
	const hourlyRequest = useSWR<PassengerDemandOverTimePoint[], Error>(
		isEnabled ? `${API_ROUTES.performance.PASSENGER_DEMAND_OVER_TIME}?${hourlyQuery.toString()}` : null,
	);

	//
	// C. Return data

	return {
		data: {
			comparisonPoints: comparisonRequest.data ?? [],
			currentPoints: currentRequest.data ?? [],
			hasCurrentData: currentRequest.data !== undefined,
			hourlyPoints: hourlyRequest.data ?? [],
		},
		flags: {
			has_error: !!currentRequest.error || !!comparisonRequest.error || !!hourlyRequest.error,
			is_loading: currentRequest.isLoading || comparisonRequest.isLoading || hourlyRequest.isLoading,
		},
	};

	//
}
