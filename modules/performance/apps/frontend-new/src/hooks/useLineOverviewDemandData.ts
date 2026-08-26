'use client';

/* * */

import { useLineDemandSeries } from '@/hooks/useLineDemandSeries';
import { toPassengerDemandComparison } from '@/utils/baseline-comparison';
import { type PerformancePeriods } from '@/utils/performance-periods';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandBaselineComparison, type PassengerDemandByPatternItem, type PassengerDemandComparison } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseLineOverviewDemandDataOptions {
	agencyId: string
	hasPatterns: boolean
	isEnabled: boolean
	lineId: string
	periods: PerformancePeriods
	usesBaselineComparison: boolean
}

/* * */

export function useLineOverviewDemandData({ agencyId, hasPatterns, isEnabled, lineId, periods, usesBaselineComparison }: UseLineOverviewDemandDataOptions) {
	//

	//
	// A. Setup variables

	const demandSeries = useLineDemandSeries({
		agencyId,
		includeComparison: !usesBaselineComparison,
		isEnabled,
		lineId,
		periods,
	});
	const comparisonQuery = new URLSearchParams({
		agency_id: agencyId,
		comparison_end_date: periods.comparison.endDate,
		comparison_start_date: periods.comparison.startDate,
		current_end_date: periods.current.endDate,
		current_start_date: periods.current.startDate,
		exclude_unknown: 'true',
		line_id: lineId,
	});
	const baselineQuery = new URLSearchParams({
		agency_id: agencyId,
		exclude_unknown: 'true',
		line_id: lineId,
		operational_date: periods.current.startDate,
	});
	const patternQuery = new URLSearchParams({
		agency_id: agencyId,
		end_date: periods.current.endDate,
		exclude_unknown: 'true',
		limit: '1000',
		line_id: lineId,
		start_date: periods.current.startDate,
	});

	//
	// B. Fetch data

	const comparisonRequest = useSWR<PassengerDemandComparison, Error>(
		isEnabled && !usesBaselineComparison
			? `${API_ROUTES.performance.PASSENGER_DEMAND_COMPARISON}?${comparisonQuery.toString()}`
			: null,
	);
	const baselineRequest = useSWR<PassengerDemandBaselineComparison, Error>(
		isEnabled && usesBaselineComparison
			? `${API_ROUTES.performance.PASSENGER_DEMAND_BASELINE_COMPARISON}?${baselineQuery.toString()}`
			: null,
	);
	const patternRequest = useSWR<PassengerDemandByPatternItem[], Error>(
		isEnabled && hasPatterns
			? `${API_ROUTES.performance.PASSENGER_DEMAND_BY_PATTERN}?${patternQuery.toString()}`
			: null,
	);

	//
	// C. Transform data

	const comparison = useMemo(
		() => usesBaselineComparison
			? baselineRequest.data ? toPassengerDemandComparison(baselineRequest.data) : undefined
			: comparisonRequest.data,
		[baselineRequest.data, comparisonRequest.data, usesBaselineComparison],
	);
	const demandByPatternCode = useMemo(
		() => new Map(patternRequest.data?.map(item => [item.pattern_id, item.passenger_demand]) ?? []),
		[patternRequest.data],
	);
	const totalDemand = useMemo(
		() => demandSeries.data.hasCurrentData
			? demandSeries.data.currentPoints.reduce((total, point) => total + point.passenger_demand, 0)
			: null,
		[demandSeries.data.currentPoints, demandSeries.data.hasCurrentData],
	);

	//
	// D. Return data

	return {
		data: {
			baselineMeta: baselineRequest.data?.meta,
			comparison,
			comparisonPoints: demandSeries.data.comparisonPoints,
			demandByPatternCode,
			hourlyPoints: demandSeries.data.hourlyPoints,
			points: demandSeries.data.currentPoints,
			totalDemand,
		},
		flags: {
			has_error: demandSeries.flags.has_error || !!comparisonRequest.error || !!baselineRequest.error,
			has_pattern_error: !!patternRequest.error,
			is_loading: demandSeries.flags.is_loading || comparisonRequest.isLoading || baselineRequest.isLoading,
			is_pattern_loading: patternRequest.isLoading,
		},
	};

	//
}
