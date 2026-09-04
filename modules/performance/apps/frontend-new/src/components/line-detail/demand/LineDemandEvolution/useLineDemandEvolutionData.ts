'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDetailData } from '@/data/demo-performance';
import { usePassengerDemandBaseline } from '@/hooks/passenger-demand/usePassengerDemandBaseline';
import { usePassengerDemandPeriodComparison } from '@/hooks/passenger-demand/usePassengerDemandPeriodComparison';
import { toPassengerDemandComparison } from '@/utils/baseline-comparison';
import { formatPeriodRangeLabel, getComparisonDescriptionKey } from '@/utils/performance-period-labels';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function useLineDemandEvolutionData() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const lineScope = useLineScopeContext();
	const { comparisonMode, demoRefreshIndex, identity, lineId, locale, periods } = lineScope.data;
	const isBaselineComparison = comparisonMode === 'comparable-weekdays';
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const grain = periods.isSingleDay ? 'hour' : 'day';
	const commonFilters = { agencyId: identity.agency_id, excludeUnknown: true, lineId: identity.line_id };

	//
	// B. Fetch data

	const series = usePassengerDemandPeriodComparison({
		comparisonEnabled: !isBaselineComparison,
		comparisonFilters: { ...commonFilters, endDate: periods.comparison.endDate, startDate: periods.comparison.startDate },
		currentFilters: { ...commonFilters, endDate: periods.current.endDate, startDate: periods.current.startDate },
		enabled: isLiveDataEnabled,
		grain,
	});
	const currentRequest = series.current;
	const comparisonSeriesRequest = series.comparison;
	const baselineRequest = usePassengerDemandBaseline({
		agencyId: identity.agency_id,
		enabled: isLiveDataEnabled && isBaselineComparison,
		excludeUnknown: true,
		lineId: identity.line_id,
		operationalDate: periods.current.startDate,
	});

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineDetailData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);
	const points = demoData?.points ?? currentRequest.data?.points ?? [];
	const comparisonPoints = isBaselineComparison ? [] : demoData?.comparisonPoints ?? comparisonSeriesRequest.data?.points ?? [];
	const currentTotal = currentRequest.data?.total;
	const comparison = isBaselineComparison
		? baselineRequest.data ? toPassengerDemandComparison(baselineRequest.data) : undefined
		: demoData?.comparison ?? series.difference;
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
	const baselineLabel = t(getComparisonDescriptionKey(comparisonMode));
	const comparisonLabel = isBaselineComparison
		? `${baselineLabel}${baselineDates ? ` · ${baselineDates}` : ''}${comparisonFootnote ? `. ${comparisonFootnote}` : ''}`
		: formatPeriodRangeLabel(periods.comparison, locale);
	const total = demoData ? points.reduce((sum, point) => sum + point.passenger_demand, 0) : currentTotal ?? null;

	//
	// D. Return data

	return {
		data: {
			average: total === null || points.length === 0 ? null : total / points.length,
			comparison,
			comparisonLabel,
			comparisonPoints,
			isSingleDay: periods.isSingleDay,
			line: lineScope.data.line,
			points,
			total,
		},
		flags: {
			has_comparison_series: !isBaselineComparison,
			has_error: isLiveDataEnabled && (!!currentRequest.error || !!comparisonSeriesRequest.error || !!baselineRequest.error),
			is_loading: isLiveDataEnabled && (currentRequest.isLoading || comparisonSeriesRequest.isLoading || baselineRequest.isLoading),
		},
	};

	//
}
