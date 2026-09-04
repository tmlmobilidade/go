'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineSupplyData } from '@/data/demo-performance';
import { usePlannedSupplySeries } from '@/hooks/planned-supply/usePlannedSupply';
import { calculateMetricDifferencePct } from '@/utils/metric-trend';
import { formatPeriodRangeLabel } from '@/utils/performance-period-labels';
import { useMemo } from 'react';

/* * */

export function useLineSupplyKpisData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { demoRefreshIndex, identity, lineId, locale, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const commonFilters = { agencyId: identity.agency_id, lineId: identity.line_id };

	//
	// B. Fetch data

	const currentRequest = usePlannedSupplySeries({ ...commonFilters, endDate: periods.current.endDate, startDate: periods.current.startDate }, isLiveDataEnabled);
	const comparisonRequest = usePlannedSupplySeries({ ...commonFilters, endDate: periods.comparison.endDate, startDate: periods.comparison.startDate }, isLiveDataEnabled);

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineSupplyData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);
	const comparison = demoData?.dashboard.comparison ?? comparisonRequest.data?.totals;
	const current = demoData?.dashboard.current ?? currentRequest.data?.totals;
	const differences = current && comparison ? {
		rides_per_active_day: calculateMetricDifferencePct(current.rides_per_active_day, comparison.rides_per_active_day),
		scheduled_rides_qty: calculateMetricDifferencePct(current.scheduled_rides_qty, comparison.scheduled_rides_qty),
		scheduled_vehicle_km: calculateMetricDifferencePct(current.scheduled_vehicle_km, comparison.scheduled_vehicle_km),
		vehicle_km_per_active_day: calculateMetricDifferencePct(current.vehicle_km_per_active_day, comparison.vehicle_km_per_active_day),
	} : undefined;

	//
	// D. Return data

	return {
		data: {
			comparison,
			comparisonLabel: formatPeriodRangeLabel(periods.comparison, locale),
			current,
			differences,
		},
		flags: {
			has_error: isLiveDataEnabled ? !!currentRequest.error || !!comparisonRequest.error : !demoData,
			is_loading: isLiveDataEnabled && (currentRequest.isLoading || comparisonRequest.isLoading),
		},
	};

	//
}
