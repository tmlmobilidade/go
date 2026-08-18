'use client';

/* * */

import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { appendPatternMetricCodes } from '@/utils/pattern-metrics';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { createPerformanceNetworkLineId, type DemandByPatternMetric, parsePerformanceNetworkLineId, type PassengerDemandComparison, type PassengerDemandOverTimePoint, type PerformanceNetworkLineDetail } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

function formatOperationalDate(date: Date) {
	return new Intl.DateTimeFormat('sv-SE', {
		day: '2-digit',
		month: '2-digit',
		timeZone: 'Europe/Lisbon',
		year: 'numeric',
	}).format(date);
}

function getDateRanges(dateFilter: string) {
	const currentEnd = new Date();
	if (dateFilter === 'yesterday') currentEnd.setDate(currentEnd.getDate() - 1);

	const currentStart = new Date(currentEnd);
	currentStart.setDate(1);

	const comparisonStart = new Date(currentStart);
	comparisonStart.setMonth(comparisonStart.getMonth() - 1);
	const comparisonEnd = new Date(comparisonStart);
	const comparisonMonthLastDay = new Date(comparisonStart.getFullYear(), comparisonStart.getMonth() + 1, 0).getDate();
	comparisonEnd.setDate(Math.min(currentEnd.getDate(), comparisonMonthLastDay));

	return {
		comparisonEnd: formatOperationalDate(comparisonEnd),
		comparisonStart: formatOperationalDate(comparisonStart),
		currentEnd: formatOperationalDate(currentEnd),
		currentStart: formatOperationalDate(currentStart),
	};
}

/* * */

export function useLineDetailData(lineId: string) {
	//

	//
	// A. Setup variables

	const filtersContext = usePerformanceFiltersContext();
	const dateRanges = getDateRanges(filtersContext.filters.date.value);
	const lineIdentity = parsePerformanceNetworkLineId(lineId);
	const networkLineId = createPerformanceNetworkLineId(lineIdentity.agency_id, lineIdentity.line_id);
	const demandQuery = new URLSearchParams({
		agency_id: lineIdentity.agency_id,
		end_date: dateRanges.currentEnd,
		exclude_unknown: 'true',
		line_id: lineIdentity.line_id,
		start_date: dateRanges.currentStart,
		time_grain: 'day',
	});
	const comparisonQuery = new URLSearchParams({
		agency_id: lineIdentity.agency_id,
		comparison_end_date: dateRanges.comparisonEnd,
		comparison_start_date: dateRanges.comparisonStart,
		current_end_date: dateRanges.currentEnd,
		current_start_date: dateRanges.currentStart,
		exclude_unknown: 'true',
		line_id: lineIdentity.line_id,
	});
	const networkQuery = new URLSearchParams({
		end_date: dateRanges.currentEnd,
		start_date: dateRanges.currentStart,
	});

	//
	// B. Fetch data

	const lineRequest = useSWR<PerformanceNetworkLineDetail, Error>(
		`${API_ROUTES.performance.NETWORK_LINE_DETAIL(networkLineId)}?${networkQuery.toString()}`,
	);
	const demandRequest = useSWR<PassengerDemandOverTimePoint[], Error>(`${API_ROUTES.performance.PASSENGER_DEMAND_OVER_TIME}?${demandQuery.toString()}`);
	const comparisonRequest = useSWR<PassengerDemandComparison, Error>(`${API_ROUTES.performance.PASSENGER_DEMAND_COMPARISON}?${comparisonQuery.toString()}`);
	const patternDemandQuery = new URLSearchParams({
		end_date: dateRanges.currentEnd,
		start_date: dateRanges.currentStart,
		time_grain: 'day',
	});
	appendPatternMetricCodes(patternDemandQuery, lineRequest.data?.patterns ?? []);
	const patternDemandRequest = useSWR<DemandByPatternMetric[], Error>(
		lineRequest.data?.patterns.length
			? `${API_ROUTES.performance.METRICS_DEMAND_BY_PATTERN}?${patternDemandQuery.toString()}`
			: null,
	);

	//
	// C. Transform data

	const totalDemand = useMemo(
		() => demandRequest.data?.reduce((total, point) => total + point.passenger_demand, 0) ?? null,
		[demandRequest.data],
	);
	const demandByPatternCode = useMemo(() => new Map(
		patternDemandRequest.data?.map(metric => [
			metric.properties.pattern_id,
			Object.values(metric.data).reduce((total, point) => total + point.qty, 0),
		]) ?? [],
	), [patternDemandRequest.data]);

	//
	// D. Return data

	return {
		data: {
			comparison: comparisonRequest.data,
			dateRanges,
			demandByPatternCode,
			line: lineRequest.data,
			points: demandRequest.data ?? [],
			totalDemand,
		},
		flags: {
			has_demand_error: !!demandRequest.error || !!comparisonRequest.error,
			has_line_error: !!lineRequest.error,
			has_pattern_demand_error: !!patternDemandRequest.error,
			is_demand_loading: demandRequest.isLoading || comparisonRequest.isLoading,
			is_line_loading: lineRequest.isLoading,
			is_pattern_demand_loading: patternDemandRequest.isLoading,
		},
	};

	//
}
