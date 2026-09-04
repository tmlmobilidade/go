'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineSupplyData } from '@/data/demo-performance';
import { usePlannedSupplySeries } from '@/hooks/planned-supply/usePlannedSupply';
import { formatPeriodRangeLabel } from '@/utils/performance-period-labels';
import { useMemo } from 'react';

/* * */

export function useLineSupplyEvolutionData() {
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

	//
	// D. Return data

	return {
		data: {
			comparison: demoData?.dashboard.evolution.comparison ?? comparisonRequest.data?.points ?? [],
			comparisonLabel: formatPeriodRangeLabel(periods.comparison, locale),
			current: demoData?.dashboard.evolution.current ?? currentRequest.data?.points ?? [],
			line: lineScope.data.line,
		},
		flags: {
			has_error: isLiveDataEnabled ? !!currentRequest.error || !!comparisonRequest.error : !demoData,
			is_loading: isLiveDataEnabled && (currentRequest.isLoading || comparisonRequest.isLoading),
		},
	};

	//
}
