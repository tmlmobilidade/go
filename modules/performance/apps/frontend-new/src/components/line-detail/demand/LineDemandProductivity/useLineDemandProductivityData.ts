'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDemandDashboardData } from '@/data/demo-performance';
import { usePassengerDemandProductivity } from '@/hooks/passenger-demand/usePassengerDemandProductivity';
import { calculateMetricDifferencePct } from '@/utils/metric-trend';
import { useMemo } from 'react';

/* * */

export function useLineDemandProductivityData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { comparisonMode, demoRefreshIndex, identity, lineId, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const commonFilters = { agencyId: identity.agency_id, excludeUnknown: true, lineId: identity.line_id };

	//
	// B. Fetch data

	const currentRequest = usePassengerDemandProductivity({ ...commonFilters, endDate: periods.current.endDate, startDate: periods.current.startDate }, isLiveDataEnabled);
	const comparisonRequest = usePassengerDemandProductivity({ ...commonFilters, endDate: periods.comparison.endDate, startDate: periods.comparison.startDate }, isLiveDataEnabled && comparisonMode !== 'comparable-weekdays');

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineDemandDashboardData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);
	const productivity = demoData?.dashboard.productivity ?? (currentRequest.data ? {
		comparison: comparisonRequest.data?.productivity ?? currentRequest.data.productivity,
		current: currentRequest.data.productivity,
	} : undefined);
	const comparison = productivity?.comparison;
	const current = productivity?.current;
	const differences = current && comparison ? {
		delivered_vehicle_km: calculateMetricDifferencePct(current.delivered_vehicle_km, comparison.delivered_vehicle_km),
		operated_rides_qty: calculateMetricDifferencePct(current.operated_rides_qty, comparison.operated_rides_qty),
		validations_per_delivered_vehicle_km: calculateMetricDifferencePct(current.validations_per_delivered_vehicle_km, comparison.validations_per_delivered_vehicle_km),
		validations_per_operated_ride: calculateMetricDifferencePct(current.validations_per_operated_ride, comparison.validations_per_operated_ride),
	} : undefined;

	//
	// D. Return data

	return {
		data: { differences, productivity },
		flags: {
			has_comparison: comparisonMode !== 'comparable-weekdays',
			has_error: isLiveDataEnabled && (!!currentRequest.error || !!comparisonRequest.error),
			is_loading: isLiveDataEnabled && (currentRequest.isLoading || comparisonRequest.isLoading),
		},
	};

	//
}
