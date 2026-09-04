'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDetailData } from '@/data/demo-performance';
import { usePassengerDemandBaseline } from '@/hooks/passenger-demand/usePassengerDemandBaseline';
import { usePassengerDemandPeriodComparison } from '@/hooks/passenger-demand/usePassengerDemandPeriodComparison';
import { usePassengerDemandSeries } from '@/hooks/passenger-demand/usePassengerDemandSeries';
import { toPassengerDemandComparison } from '@/utils/baseline-comparison';
import { formatPeriodRangeLabel, getComparisonDescriptionKey } from '@/utils/performance-period-labels';
import { type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function useLineDemandKpisData() {
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
	const hourlyRequest = usePassengerDemandSeries({
		enabled: isLiveDataEnabled,
		filters: { ...commonFilters, endDate: periods.current.endDate, startDate: periods.current.startDate },
		grain: 'hour',
	});
	const comparisonRequest = series.comparison;
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
	const currentPoints = demoData?.points ?? currentRequest.data?.points ?? [];
	const hourlyPoints = demoData?.hourlyDemandPoints ?? hourlyRequest.data?.points ?? [];
	const currentTotal = demoData ? currentPoints.reduce((total, point) => total + point.passenger_demand, 0) : currentRequest.data?.total ?? 0;
	const comparison = isBaselineComparison
		? baselineRequest.data ? toPassengerDemandComparison(baselineRequest.data) : undefined
		: demoData?.comparison ?? series.difference;
	const busiestPoint = currentPoints.reduce<PassengerDemandOverTimePoint | undefined>((result, point) => (
		!result || point.passenger_demand > result.passenger_demand ? point : result
	), undefined);
	const demandByHour = new Map<number, number>();
	for (const point of hourlyPoints) {
		const hour = new Date(point.period).toLocaleString('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Lisbon' });
		const parsedHour = Number(hour);
		demandByHour.set(parsedHour, (demandByHour.get(parsedHour) ?? 0) + point.passenger_demand);
	}
	const peakHourEntry = [...demandByHour.entries()].sort((a, b) => b[1] - a[1])[0];
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

	//
	// D. Return data

	return {
		data: {
			average: currentPoints.length ? currentTotal / currentPoints.length : 0,
			busiestPoint,
			comparisonLabel,
			currentTotal,
			differencePct: comparison?.difference_pct ?? null,
			isSingleDay: periods.isSingleDay,
			peakHour: peakHourEntry ? { hour: peakHourEntry[0], passenger_demand: peakHourEntry[1] } : undefined,
			peakShare: peakHourEntry && currentTotal ? peakHourEntry[1] / currentTotal * 100 : 0,
		},
		flags: {
			has_error: isLiveDataEnabled && (!!currentRequest.error || !!hourlyRequest.error || !!comparisonRequest.error || !!baselineRequest.error),
			is_loading: isLiveDataEnabled && (currentRequest.isLoading || hourlyRequest.isLoading || comparisonRequest.isLoading || baselineRequest.isLoading),
		},
	};

	//
}
