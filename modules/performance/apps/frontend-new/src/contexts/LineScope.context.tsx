'use client';

/* * */

import { useDemoDataContext } from '@/contexts/DemoData.context';
import { usePerformanceFiltersContext } from '@/contexts/PerformanceFilters.context';
import { DEMO_LINES } from '@/data/demo-performance';
import { getPerformancePeriods } from '@/utils/performance-comparisons';
import { resolvePerformanceLocale } from '@/utils/performance-formatters';
import { type PerformanceComparison, type PerformancePeriods } from '@/utils/performance-periods';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { createPerformanceNetworkLineId, parsePerformanceNetworkLineId, type PerformanceNetworkLineDetail } from '@tmlmobilidade/go-types-performance';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

interface LineScopeContextState {
	data: {
		comparisonMode: PerformanceComparison
		demoRefreshIndex: number
		identity: ReturnType<typeof parsePerformanceNetworkLineId>
		line?: PerformanceNetworkLineDetail
		lineId: string
		locale: string
		periods: PerformancePeriods
	}
	flags: {
		has_line_error: boolean
		is_demo: boolean
		is_line_loading: boolean
	}
}

interface LineScopeContextProviderProps extends PropsWithChildren {
	lineId: string
}

/* * */

const LineScopeContext = createContext<LineScopeContextState | undefined>(undefined);

/* * */

export function useLineScopeContext() {
	const context = useContext(LineScopeContext);
	if (!context) throw new Error('useLineScopeContext must be used within a LineScopeContextProvider');
	return context;
}

/* * */

export function LineScopeContextProvider({ children, lineId }: LineScopeContextProviderProps) {
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
	const demoLine = useMemo(() => DEMO_LINES.find(line => line._id === decodeURIComponent(lineId)), [lineId]);
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
	// C. Render components

	return (
		<LineScopeContext.Provider
			value={{
				data: {
					comparisonMode,
					demoRefreshIndex: demoDataContext.data.refresh_index,
					identity,
					line: demoDataContext.flags.is_enabled ? demoLine : lineRequest.data,
					lineId,
					locale,
					periods,
				},
				flags: {
					has_line_error: demoDataContext.flags.is_enabled ? !demoLine : !!lineRequest.error,
					is_demo: demoDataContext.flags.is_enabled,
					is_line_loading: !demoDataContext.flags.is_enabled && lineRequest.isLoading,
				},
			}}
		>
			{children}
		</LineScopeContext.Provider>
	);

	//
}
