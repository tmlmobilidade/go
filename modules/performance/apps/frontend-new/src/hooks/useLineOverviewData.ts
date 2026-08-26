'use client';

/* * */

import { createDemoLineDetailData } from '@/data/demo-performance';
import { useLineDetailScope } from '@/hooks/useLineDetailScope';
import { useLineOverviewDemandData } from '@/hooks/useLineOverviewDemandData';
import { useLineOverviewOperationalData } from '@/hooks/useLineOverviewOperationalData';
import { formatPeriodRangeLabel, getComparisonDescriptionKey } from '@/utils/performance-period-labels';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function useLineOverviewData(lineId: string) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const lineScope = useLineDetailScope(lineId);
	const { comparisonMode, demoRefreshIndex, identity, locale, periods } = lineScope.data;
	const usesBaselineComparison = comparisonMode === 'comparable-weekdays';
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const demand = useLineOverviewDemandData({
		agencyId: identity.agency_id,
		hasPatterns: !!lineScope.data.line?.patterns.length,
		isEnabled: isLiveDataEnabled,
		lineId: identity.line_id,
		periods,
		usesBaselineComparison,
	});
	const operational = useLineOverviewOperationalData({
		agencyId: identity.agency_id,
		isEnabled: isLiveDataEnabled,
		lineId: identity.line_id,
		periods,
		usesBaselineComparison,
	});

	//
	// B. Transform data

	const baselineMeta = demand.data.baselineMeta ?? operational.data.baselineMeta;
	const baselineSampleSize = baselineMeta?.baseline_sample_size;
	const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(`${periods.current.startDate}T12:00:00`));
	const comparisonFootnote = usesBaselineComparison && baselineSampleSize !== undefined && baselineSampleSize < 8
		? t('lineDetail.comparison.baselineFootnote', { count: baselineSampleSize, weekday })
		: undefined;
	const baselineDates = baselineMeta?.baseline_operational_dates.map((date) => {
		const value = String(date);
		return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T12:00:00Z`));
	}).join(', ');
	const comparisonLabel = t(getComparisonDescriptionKey(comparisonMode));
	const resolvedComparisonLabel = usesBaselineComparison
		? `${comparisonLabel}${baselineDates ? ` · ${baselineDates}` : ''}${comparisonFootnote ? `. ${comparisonFootnote}` : ''}`
		: t('lineDetail.comparison.againstRange', { range: formatPeriodRangeLabel(periods.comparison, locale) });
	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineDetailData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);

	if (lineScope.flags.is_demo) {
		return {
			data: {
				...demoData,
				comparisonLabel: resolvedComparisonLabel,
				periods,
			},
			flags: {
				has_demand_error: false,
				has_line_error: !demoData,
				has_operational_error: false,
				has_operational_heatmap_error: false,
				has_pattern_demand_error: false,
				has_pattern_operational_error: false,
				is_demand_loading: false,
				is_line_loading: false,
				is_operational_heatmap_loading: false,
				is_operational_loading: false,
				is_pattern_demand_loading: false,
				is_pattern_operational_loading: false,
			},
		};
	}

	//
	// C. Return data

	return {
		data: {
			comparison: demand.data.comparison,
			comparisonLabel: resolvedComparisonLabel,
			comparisonPoints: demand.data.comparisonPoints,
			demandByPatternCode: demand.data.demandByPatternCode,
			hourlyDemandPoints: demand.data.hourlyPoints,
			line: lineScope.data.line,
			operationalByPatternCode: operational.data.operationalByPatternCode,
			operationalComparison: operational.data.comparison,
			operationalHeatmap: operational.data.heatmap,
			operationalPoints: operational.data.points,
			periods,
			points: demand.data.points,
			totalDemand: demand.data.totalDemand,
		},
		flags: {
			has_demand_error: demand.flags.has_error,
			has_line_error: lineScope.flags.has_line_error,
			has_operational_error: operational.flags.has_error,
			has_operational_heatmap_error: operational.flags.has_heatmap_error,
			has_pattern_demand_error: demand.flags.has_pattern_error,
			has_pattern_operational_error: operational.flags.has_pattern_error,
			is_demand_loading: demand.flags.is_loading,
			is_line_loading: lineScope.flags.is_line_loading,
			is_operational_heatmap_loading: operational.flags.is_heatmap_loading,
			is_operational_loading: operational.flags.is_loading,
			is_pattern_demand_loading: demand.flags.is_pattern_loading,
			is_pattern_operational_loading: operational.flags.is_pattern_loading,
		},
	};

	//
}
