'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDemandDashboardData } from '@/data/demo-performance';
import { usePassengerDemandBreakdown } from '@/hooks/passenger-demand/usePassengerDemandBreakdown';
import { type PassengerDemandBreakdown, type PassengerDemandCompositionItem } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';

/* * */

function toComposition(current?: PassengerDemandBreakdown, comparison?: PassengerDemandBreakdown): PassengerDemandCompositionItem[] {
	const currentById = new Map(current?.items.map(item => [item.id, item.passenger_demand]) ?? []);
	const comparisonById = new Map(comparison?.items.map(item => [item.id, item.passenger_demand]) ?? []);
	const currentTotal = current?.total ?? 0;
	const comparisonTotal = comparison?.total ?? 0;
	return [...new Set([...currentById.keys(), ...comparisonById.keys()])].map((id) => {
		const currentQty = currentById.get(id) ?? 0;
		const comparisonQty = comparisonById.get(id) ?? 0;
		const currentShare = currentTotal ? currentQty / currentTotal * 100 : 0;
		const comparisonShare = comparisonTotal ? comparisonQty / comparisonTotal * 100 : 0;
		return {
			comparison_qty: comparisonQty,
			comparison_share_pct: comparisonShare,
			current_qty: currentQty,
			current_share_pct: currentShare,
			id,
			share_delta_pp: currentShare - comparisonShare,
		};
	}).sort((a, b) => b.current_qty - a.current_qty || a.id.localeCompare(b.id));
}

/* * */

export function useLineDemandCompositionData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { comparisonMode, demoRefreshIndex, identity, lineId, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const hasComparison = comparisonMode !== 'comparable-weekdays';
	const commonFilters = { agencyId: identity.agency_id, excludeUnknown: false, lineId: identity.line_id };
	const currentFilters = { ...commonFilters, endDate: periods.current.endDate, startDate: periods.current.startDate };
	const comparisonFilters = { ...commonFilters, endDate: periods.comparison.endDate, startDate: periods.comparison.startDate };

	//
	// B. Fetch data

	const currentCategories = usePassengerDemandBreakdown({ dimension: 'category', enabled: isLiveDataEnabled, filters: currentFilters });
	const comparisonCategories = usePassengerDemandBreakdown({ dimension: 'category', enabled: isLiveDataEnabled && hasComparison, filters: comparisonFilters });
	const currentProducts = usePassengerDemandBreakdown({ dimension: 'product', enabled: isLiveDataEnabled, filters: currentFilters });
	const comparisonProducts = usePassengerDemandBreakdown({ dimension: 'product', enabled: isLiveDataEnabled && hasComparison, filters: comparisonFilters });

	//
	// C. Transform data

	const demoData = useMemo(() => lineScope.flags.is_demo ? createDemoLineDemandDashboardData(lineId, periods, demoRefreshIndex) : undefined, [demoRefreshIndex, lineId, lineScope.flags.is_demo, periods]);

	//
	// D. Return data

	return {
		data: {
			categories: demoData?.dashboard.composition.categories ?? toComposition(currentCategories.data, comparisonCategories.data),
			line: lineScope.data.line,
			products: demoData?.dashboard.composition.products ?? toComposition(currentProducts.data, comparisonProducts.data),
		},
		flags: {
			has_comparison: hasComparison,
			has_error: isLiveDataEnabled && [currentCategories, comparisonCategories, currentProducts, comparisonProducts].some(request => !!request.error),
			is_loading: isLiveDataEnabled && [currentCategories, comparisonCategories, currentProducts, comparisonProducts].some(request => request.isLoading),
		},
	};

	//
}

/* * */
