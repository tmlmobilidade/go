'use client';

/* * */

import { getAvailableComparisons, normalizeComparison } from '@/utils/performance-comparisons';
import { getDefaultPerformanceComparison, getDefaultPerformancePeriod, getPerformanceScreen, isLineDetailPath, isPerformanceComparison, isPeriodPreset } from '@/utils/performance-filter-policy';
import { resolvePerformanceLocale } from '@/utils/performance-formatters';
import { getComparisonContextLabel, getComparisonDescriptionKey, getComparisonLabelKey } from '@/utils/performance-period-labels';
import { type PerformancePeriodSelection } from '@/utils/performance-periods';
import { useQueryState } from '@tmlmobilidade/ui';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function usePerformancePeriodFilters() {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation('default');
	const locale = resolvePerformanceLocale(i18n.language);
	const pathname = usePathname();
	const screen = getPerformanceScreen(pathname);
	const comparisonAvailability = useMemo(() => ({ allowComparableWeekdays: isLineDetailPath(pathname) }), [pathname]);
	const defaultPeriod = useMemo(() => getDefaultPerformancePeriod(screen), [screen]);
	const defaultComparison = getDefaultPerformanceComparison(screen);
	const [periodPresetQuery, setPeriodPresetQuery] = useQueryState('period');
	const [periodStartQuery, setPeriodStartQuery] = useQueryState('start_date');
	const [periodEndQuery, setPeriodEndQuery] = useQueryState('end_date');
	const [comparisonQuery, setComparisonQuery] = useQueryState('comparison');

	//
	// B. Transform data

	const queriedPreset = isPeriodPreset(periodPresetQuery) ? periodPresetQuery : defaultPeriod.preset;
	const period = useMemo<PerformancePeriodSelection>(() => (
		queriedPreset === 'custom' && periodStartQuery && periodEndQuery
			? { endDate: periodEndQuery, preset: 'custom', startDate: periodStartQuery }
			: queriedPreset === 'custom' ? defaultPeriod : { preset: queriedPreset }
	), [defaultPeriod, periodEndQuery, periodStartQuery, queriedPreset]);
	const comparisonOptions = useMemo(() => (
		getAvailableComparisons(period, screen, undefined, comparisonAvailability).map(comparison => ({
			description: `${t(getComparisonDescriptionKey(comparison))} · ${getComparisonContextLabel(period, comparison, locale)}`,
			label: t(getComparisonLabelKey(comparison)),
			value: comparison,
		}))
	), [comparisonAvailability, locale, period, screen, t]);
	const requestedComparison = isPerformanceComparison(comparisonQuery) ? comparisonQuery : defaultComparison;
	const normalizedComparison = normalizeComparison(period, requestedComparison, screen, undefined, comparisonAvailability);
	const comparisonContextLabel = getComparisonContextLabel(period, normalizedComparison, locale);

	//
	// C. Sync query state

	useEffect(() => {
		const nextComparisonQuery = normalizedComparison === defaultComparison ? null : normalizedComparison;
		if (comparisonQuery !== nextComparisonQuery) void setComparisonQuery(nextComparisonQuery);
	}, [comparisonQuery, defaultComparison, normalizedComparison, setComparisonQuery]);

	useEffect(() => {
		if (periodPresetQuery && (!isPeriodPreset(periodPresetQuery) || periodPresetQuery === defaultPeriod.preset)) {
			void setPeriodPresetQuery(null);
		}
		if (queriedPreset !== 'custom' && (periodStartQuery || periodEndQuery)) {
			void setPeriodStartQuery(null);
			void setPeriodEndQuery(null);
		}
	}, [defaultPeriod.preset, periodEndQuery, periodPresetQuery, periodStartQuery, queriedPreset, setPeriodEndQuery, setPeriodPresetQuery, setPeriodStartQuery]);

	//
	// D. Handle actions

	const setPeriod = (selection: PerformancePeriodSelection) => {
		void setPeriodPresetQuery(selection.preset === defaultPeriod.preset ? null : selection.preset);
		void setPeriodStartQuery(selection.preset === 'custom' ? selection.startDate ?? null : null);
		void setPeriodEndQuery(selection.preset === 'custom' ? selection.endDate ?? null : null);
	};

	//
	// E. Return data

	return {
		data: { comparisonContextLabel, comparisonOptions, screen },
		filters: {
			comparison: { set: (value: string) => void setComparisonQuery(value === defaultComparison ? null : value), value: normalizedComparison },
			period: { set: setPeriod, value: period },
		},
	};

	//
}
