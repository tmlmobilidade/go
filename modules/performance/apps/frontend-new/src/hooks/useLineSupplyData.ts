'use client';

/* * */

import { createDemoLineSupplyData } from '@/data/demo-performance';
import { useLineDetailScope } from '@/hooks/useLineDetailScope';
import { formatPeriodRangeLabel } from '@/utils/performance-period-labels';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PlannedSupplyLineDashboard } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function useLineSupplyData(lineId: string) {
	//

	//
	// A. Setup variables

	const lineScope = useLineDetailScope(lineId);
	const { demoRefreshIndex, identity, locale, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const dashboardQuery = new URLSearchParams({
		agency_id: identity.agency_id,
		comparison_end_date: periods.comparison.endDate,
		comparison_start_date: periods.comparison.startDate,
		current_end_date: periods.current.endDate,
		current_start_date: periods.current.startDate,
		line_id: identity.line_id,
	});

	//
	// B. Fetch data

	const dashboardRequest = useSWR<PlannedSupplyLineDashboard, Error>(
		isLiveDataEnabled
			? `${API_ROUTES.performance.RIDE_PERFORMANCE_PLANNED_SUPPLY_LINE_DASHBOARD}?${dashboardQuery.toString()}`
			: null,
	);

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineSupplyData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);

	//
	// D. Return data

	return {
		data: {
			comparisonLabel: formatPeriodRangeLabel(periods.comparison, locale),
			dashboard: demoData?.dashboard ?? dashboardRequest.data,
			line: demoData?.line ?? lineScope.data.line,
			periods,
		},
		flags: {
			has_dashboard_error: isLiveDataEnabled && !!dashboardRequest.error,
			has_line_error: lineScope.flags.is_demo ? !demoData : lineScope.flags.has_line_error,
			is_dashboard_loading: isLiveDataEnabled && dashboardRequest.isLoading,
			is_line_loading: lineScope.flags.is_line_loading,
		},
	};

	//
}
