'use client';

/* * */

import { useDemoDataContext } from '@/contexts/DemoData.context';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { resolvePerformanceLocale } from '@/hooks/usePerformanceFormatters';
import { getPerformancePeriods } from '@/utils/performance-comparisons';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { createPerformanceNetworkLineId, parsePerformanceNetworkLineId, type PerformanceNetworkLineDetail } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

export function useLineDetailScope(lineId: string) {
	//

	//
	// A. Setup variables

	const { i18n } = useTranslation('default');
	const demoDataContext = useDemoDataContext();
	const filtersContext = usePerformanceFiltersContext();
	const comparisonMode = filtersContext.filters.comparison.value;
	const periodSelection = filtersContext.filters.period.value;
	const locale = resolvePerformanceLocale(i18n.language);
	const periods = useMemo(
		() => getPerformancePeriods(periodSelection, comparisonMode),
		[comparisonMode, periodSelection],
	);
	const identity = useMemo(() => parsePerformanceNetworkLineId(lineId), [lineId]);
	const networkLineId = createPerformanceNetworkLineId(identity.agency_id, identity.line_id);
	const networkQuery = new URLSearchParams({
		end_date: periods.current.endDate,
		start_date: periods.current.startDate,
	});

	//
	// B. Fetch data

	const lineRequest = useSWR<PerformanceNetworkLineDetail, Error>(
		demoDataContext.flags.is_enabled
			? null
			: `${API_ROUTES.performance.NETWORK_LINES_DETAIL(networkLineId)}?${networkQuery.toString()}`,
	);

	//
	// C. Return data

	return {
		data: {
			comparisonMode,
			demoRefreshIndex: demoDataContext.data.refresh_index,
			identity,
			line: lineRequest.data,
			locale,
			periods,
		},
		flags: {
			has_line_error: !demoDataContext.flags.is_enabled && !!lineRequest.error,
			is_demo: demoDataContext.flags.is_enabled,
			is_line_loading: !demoDataContext.flags.is_enabled && lineRequest.isLoading,
		},
	};

	//
}
