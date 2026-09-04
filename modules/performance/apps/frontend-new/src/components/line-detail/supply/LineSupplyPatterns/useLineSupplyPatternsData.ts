'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineSupplyData } from '@/data/demo-performance';
import { usePlannedSupplyBreakdown } from '@/hooks/planned-supply/usePlannedSupply';
import { type PlannedSupplyBreakdown, type PlannedSupplyPatternItem } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';

/* * */

function toPatternItems(current?: PlannedSupplyBreakdown, comparison?: PlannedSupplyBreakdown): PlannedSupplyPatternItem[] {
	const currentById = new Map(current?.items.map(item => [item.id, item]) ?? []);
	const comparisonById = new Map(comparison?.items.map(item => [item.id, item]) ?? []);
	return [...new Set([...currentById.keys(), ...comparisonById.keys()])].map((id) => {
		const currentItem = currentById.get(id);
		const comparisonItem = comparisonById.get(id);
		const currentRides = currentItem?.scheduled_rides_qty ?? 0;
		const comparisonRides = comparisonItem?.scheduled_rides_qty ?? 0;
		return {
			comparison_rides_qty: comparisonRides,
			comparison_vehicle_km: comparisonItem?.scheduled_vehicle_km ?? 0,
			current_rides_qty: currentRides,
			current_vehicle_km: currentItem?.scheduled_vehicle_km ?? 0,
			id,
			rides_difference_pct: comparisonRides ? (currentRides - comparisonRides) / comparisonRides * 100 : null,
			rides_share_pct: currentItem?.rides_share_pct ?? 0,
		};
	}).sort((a, b) => b.current_rides_qty - a.current_rides_qty || a.id.localeCompare(b.id));
}

/* * */

export function useLineSupplyPatternsData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { demoRefreshIndex, identity, lineId, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const commonFilters = { agencyId: identity.agency_id, lineId: identity.line_id };

	//
	// B. Fetch data

	const currentRequest = usePlannedSupplyBreakdown({ ...commonFilters, endDate: periods.current.endDate, startDate: periods.current.startDate }, isLiveDataEnabled);
	const comparisonRequest = usePlannedSupplyBreakdown({ ...commonFilters, endDate: periods.comparison.endDate, startDate: periods.comparison.startDate }, isLiveDataEnabled);

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
			items: demoData?.dashboard.patterns ?? toPatternItems(currentRequest.data, comparisonRequest.data),
			line: lineScope.data.line,
			patterns: lineScope.data.line?.patterns ?? [],
		},
		flags: {
			has_error: isLiveDataEnabled ? !!currentRequest.error || !!comparisonRequest.error : !demoData,
			is_loading: isLiveDataEnabled && (currentRequest.isLoading || comparisonRequest.isLoading),
		},
	};

	//
}
