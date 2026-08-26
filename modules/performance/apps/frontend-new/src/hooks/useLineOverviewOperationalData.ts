'use client';

/* * */

import { toRidePerformanceComparison } from '@/utils/baseline-comparison';
import { type PerformancePeriods } from '@/utils/performance-periods';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RidePerformanceBaselineComparison, type RidePerformanceByPatternItem, type RidePerformanceComparison, type RidePerformanceHeatmapCell, type RidePerformanceOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseLineOverviewOperationalDataOptions {
	agencyId: string
	isEnabled: boolean
	lineId: string
	periods: PerformancePeriods
	usesBaselineComparison: boolean
}

/* * */

export function useLineOverviewOperationalData({ agencyId, isEnabled, lineId, periods, usesBaselineComparison }: UseLineOverviewOperationalDataOptions) {
	//

	//
	// A. Setup variables

	const baseQuery = new URLSearchParams({
		agency_id: agencyId,
		end_date: periods.current.endDate,
		exclude_unknown: 'true',
		line_id: lineId,
		start_date: periods.current.startDate,
	});
	const overTimeQuery = new URLSearchParams(baseQuery);
	overTimeQuery.set('time_grain', periods.isSingleDay ? 'hour' : 'day');
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
	const patternQuery = new URLSearchParams(baseQuery);
	patternQuery.set('limit', '1000');

	//
	// B. Fetch data

	const overTimeRequest = useSWR<RidePerformanceOverTimePoint[], Error>(
		isEnabled ? `${API_ROUTES.performance.RIDE_PERFORMANCE_OVER_TIME}?${overTimeQuery.toString()}` : null,
	);
	const comparisonRequest = useSWR<RidePerformanceComparison, Error>(
		isEnabled && !usesBaselineComparison
			? `${API_ROUTES.performance.RIDE_PERFORMANCE_COMPARISON}?${comparisonQuery.toString()}`
			: null,
	);
	const baselineRequest = useSWR<RidePerformanceBaselineComparison, Error>(
		isEnabled && usesBaselineComparison
			? `${API_ROUTES.performance.RIDE_PERFORMANCE_BASELINE_COMPARISON}?${baselineQuery.toString()}`
			: null,
	);
	const patternRequest = useSWR<RidePerformanceByPatternItem[], Error>(
		isEnabled ? `${API_ROUTES.performance.RIDE_PERFORMANCE_BY_PATTERN}?${patternQuery.toString()}` : null,
	);
	const heatmapRequest = useSWR<RidePerformanceHeatmapCell[], Error>(
		isEnabled ? `${API_ROUTES.performance.RIDE_PERFORMANCE_HEATMAP}?${baseQuery.toString()}` : null,
	);

	//
	// C. Transform data

	const comparison = useMemo(
		() => usesBaselineComparison
			? baselineRequest.data ? toRidePerformanceComparison(baselineRequest.data) : undefined
			: comparisonRequest.data,
		[baselineRequest.data, comparisonRequest.data, usesBaselineComparison],
	);
	const operationalByPatternCode = useMemo(
		() => new Map(patternRequest.data?.map(item => [item.pattern_id, item]) ?? []),
		[patternRequest.data],
	);

	//
	// D. Return data

	return {
		data: {
			baselineMeta: baselineRequest.data?.meta,
			comparison,
			heatmap: heatmapRequest.data ?? [],
			operationalByPatternCode,
			points: overTimeRequest.data ?? [],
		},
		flags: {
			has_error: !!overTimeRequest.error || !!comparisonRequest.error || !!baselineRequest.error,
			has_heatmap_error: !!heatmapRequest.error,
			has_pattern_error: !!patternRequest.error,
			is_heatmap_loading: heatmapRequest.isLoading,
			is_loading: overTimeRequest.isLoading || comparisonRequest.isLoading || baselineRequest.isLoading,
			is_pattern_loading: patternRequest.isLoading,
		},
	};

	//
}
