'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDetailData } from '@/data/demo-performance';
import { usePassengerDemandSeries } from '@/hooks/passenger-demand/usePassengerDemandSeries';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RidePerformanceHeatmapCell } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function useLineOverviewReliabilityHeatmapData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { demoRefreshIndex, identity, lineId, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const operationalQuery = new URLSearchParams({
		agency_id: identity.agency_id,
		end_date: periods.current.endDate,
		exclude_unknown: 'true',
		line_id: identity.line_id,
		start_date: periods.current.startDate,
	});

	//
	// B. Fetch data

	const demandRequest = usePassengerDemandSeries({
		enabled: isLiveDataEnabled,
		filters: { agencyId: identity.agency_id, endDate: periods.current.endDate, excludeUnknown: true, lineId: identity.line_id, startDate: periods.current.startDate },
		grain: 'hour',
	});
	const operationalRequest = useSWR<RidePerformanceHeatmapCell[], Error>(
		isLiveDataEnabled ? `${API_ROUTES.performance.RIDE_PERFORMANCE_HEATMAP}?${operationalQuery.toString()}` : null,
	);

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineDetailData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);

	//
	// D. Return data

	return {
		data: {
			demandPoints: demoData?.hourlyDemandPoints ?? demandRequest.data?.points ?? [],
			line: lineScope.data.line,
			operationalCells: demoData?.operationalHeatmap ?? operationalRequest.data ?? [],
		},
		flags: {
			has_demand_error: isLiveDataEnabled && !!demandRequest.error,
			has_operational_error: isLiveDataEnabled && !!operationalRequest.error,
			is_demand_loading: isLiveDataEnabled && demandRequest.isLoading,
			is_operational_loading: isLiveDataEnabled && operationalRequest.isLoading,
		},
	};

	//
}
