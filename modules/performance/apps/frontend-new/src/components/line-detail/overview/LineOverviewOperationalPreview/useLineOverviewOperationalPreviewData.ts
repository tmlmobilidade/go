'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDetailData } from '@/data/demo-performance';
import { toRidePerformanceComparison } from '@/utils/baseline-comparison';
import { formatPeriodRangeLabel, getComparisonDescriptionKey } from '@/utils/performance-period-labels';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RidePerformanceBaselineComparison, type RidePerformanceComparison, type RidePerformanceOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

export function useLineOverviewOperationalPreviewData() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const lineScope = useLineScopeContext();
	const { comparisonMode, demoRefreshIndex, identity, lineId, locale, periods } = lineScope.data;
	const isBaselineComparison = comparisonMode === 'comparable-weekdays';
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const seriesQuery = new URLSearchParams({
		agency_id: identity.agency_id,
		end_date: periods.current.endDate,
		exclude_unknown: 'true',
		line_id: identity.line_id,
		start_date: periods.current.startDate,
		time_grain: periods.isSingleDay ? 'hour' : 'day',
	});
	const comparisonQuery = new URLSearchParams({
		agency_id: identity.agency_id,
		comparison_end_date: periods.comparison.endDate,
		comparison_start_date: periods.comparison.startDate,
		current_end_date: periods.current.endDate,
		current_start_date: periods.current.startDate,
		exclude_unknown: 'true',
		line_id: identity.line_id,
	});
	const baselineQuery = new URLSearchParams({
		agency_id: identity.agency_id,
		exclude_unknown: 'true',
		line_id: identity.line_id,
		operational_date: periods.current.startDate,
	});

	//
	// B. Fetch data

	const seriesRequest = useSWR<RidePerformanceOverTimePoint[], Error>(
		isLiveDataEnabled ? `${API_ROUTES.performance.RIDE_PERFORMANCE_OVER_TIME}?${seriesQuery.toString()}` : null,
	);
	const comparisonRequest = useSWR<RidePerformanceComparison, Error>(
		isLiveDataEnabled && !isBaselineComparison ? `${API_ROUTES.performance.RIDE_PERFORMANCE_COMPARISON}?${comparisonQuery.toString()}` : null,
	);
	const baselineRequest = useSWR<RidePerformanceBaselineComparison, Error>(
		isLiveDataEnabled && isBaselineComparison ? `${API_ROUTES.performance.RIDE_PERFORMANCE_BASELINE_COMPARISON}?${baselineQuery.toString()}` : null,
	);

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineDetailData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);
	const comparison = demoData?.operationalComparison ?? (isBaselineComparison
		? baselineRequest.data ? toRidePerformanceComparison(baselineRequest.data) : undefined
		: comparisonRequest.data);
	const baselineMeta = baselineRequest.data?.meta;
	const baselineSampleSize = baselineMeta?.baseline_sample_size;
	const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(`${periods.current.startDate}T12:00:00`));
	const comparisonFootnote = isBaselineComparison && baselineSampleSize !== undefined && baselineSampleSize < 8
		? t('lineDetail.comparison.baselineFootnote', { count: baselineSampleSize, weekday })
		: undefined;
	const baselineDates = baselineMeta?.baseline_operational_dates.map((date) => {
		const value = String(date);
		return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T12:00:00Z`));
	}).join(', ');
	const comparisonLabel = t(getComparisonDescriptionKey(comparisonMode));
	const resolvedComparisonLabel = isBaselineComparison
		? `${comparisonLabel}${baselineDates ? ` · ${baselineDates}` : ''}${comparisonFootnote ? `. ${comparisonFootnote}` : ''}`
		: t('lineDetail.comparison.againstRange', { range: formatPeriodRangeLabel(periods.comparison, locale) });

	//
	// D. Return data

	return {
		data: {
			comparison,
			comparisonLabel: resolvedComparisonLabel,
			points: demoData?.operationalPoints ?? seriesRequest.data ?? [],
		},
		flags: {
			has_error: isLiveDataEnabled && (!!seriesRequest.error || !!comparisonRequest.error || !!baselineRequest.error),
			is_loading: isLiveDataEnabled && (seriesRequest.isLoading || comparisonRequest.isLoading || baselineRequest.isLoading),
		},
	};

	//
}
