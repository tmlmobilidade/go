'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDemandDashboardData } from '@/data/demo-performance';
import { usePassengerDemandBreakdown } from '@/hooks/passenger-demand/usePassengerDemandBreakdown';
import { type PassengerDemandBreakdown, type PassengerDemandContributionItem } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';

/* * */

function toContributions(current?: PassengerDemandBreakdown, comparison?: PassengerDemandBreakdown): PassengerDemandContributionItem[] {
	const currentById = new Map(current?.items.map(item => [item.id, item]) ?? []);
	const comparisonById = new Map(comparison?.items.map(item => [item.id, item]) ?? []);
	return [...new Set([...currentById.keys(), ...comparisonById.keys()])].map((id) => {
		const currentItem = currentById.get(id);
		const comparisonItem = comparisonById.get(id);
		const currentQty = currentItem?.passenger_demand ?? 0;
		const comparisonQty = comparisonItem?.passenger_demand ?? 0;
		return { comparison_qty: comparisonQty, current_qty: currentQty, difference_qty: currentQty - comparisonQty, id, label: currentItem?.label ?? comparisonItem?.label };
	}).sort((a, b) => b.current_qty - a.current_qty || a.id.localeCompare(b.id)).slice(0, 25);
}

/* * */

export function useLineDemandContributionsData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { comparisonMode, demoRefreshIndex, identity, lineId, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const hasComparison = comparisonMode !== 'comparable-weekdays';
	const commonFilters = { agencyId: identity.agency_id, excludeUnknown: true, lineId: identity.line_id };
	const currentFilters = { ...commonFilters, endDate: periods.current.endDate, startDate: periods.current.startDate };
	const comparisonFilters = { ...commonFilters, endDate: periods.comparison.endDate, startDate: periods.comparison.startDate };

	//
	// B. Fetch data

	const currentPatterns = usePassengerDemandBreakdown({ dimension: 'pattern', enabled: isLiveDataEnabled, filters: currentFilters, limit: 25 });
	const comparisonPatterns = usePassengerDemandBreakdown({ dimension: 'pattern', enabled: isLiveDataEnabled && hasComparison, filters: comparisonFilters, limit: 25 });
	const currentStops = usePassengerDemandBreakdown({ dimension: 'stop', enabled: isLiveDataEnabled, filters: currentFilters, limit: 25 });
	const comparisonStops = usePassengerDemandBreakdown({ dimension: 'stop', enabled: isLiveDataEnabled && hasComparison, filters: comparisonFilters, limit: 25 });

	//
	// C. Transform data

	const demoData = useMemo(() => lineScope.flags.is_demo ? createDemoLineDemandDashboardData(lineId, periods, demoRefreshIndex) : undefined, [demoRefreshIndex, lineId, lineScope.flags.is_demo, periods]);

	//
	// D. Return data

	return {
		data: {
			line: lineScope.data.line,
			patterns: demoData?.dashboard.contributions.patterns ?? toContributions(currentPatterns.data, comparisonPatterns.data),
			stops: demoData?.dashboard.contributions.stops ?? toContributions(currentStops.data, comparisonStops.data),
		},
		flags: {
			has_comparison: hasComparison,
			has_error: isLiveDataEnabled && [currentPatterns, comparisonPatterns, currentStops, comparisonStops].some(request => !!request.error),
			is_loading: isLiveDataEnabled && [currentPatterns, comparisonPatterns, currentStops, comparisonStops].some(request => request.isLoading),
		},
	};

	//
}

/* * */
