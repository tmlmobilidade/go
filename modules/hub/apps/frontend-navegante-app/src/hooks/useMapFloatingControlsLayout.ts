'use client';

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';

/* * */

export type MapFloatingControlsLayout = 'default' | 'route-results-compact' | 'route-results-full' | 'route-results-medium' | 'route-results-short' | 'route-search';

/* * */

export function useMapFloatingControlsLayout(): MapFloatingControlsLayout {
	//

	//
	// A. Setup variables

	const { activeBottomSheet, activeBottomSheetSnap } = useBottomSheet();
	const routePlannerContext = useRoutePlannerContext();

	//
	// B. Transform data

	if (activeBottomSheet?.view !== 'routes') return 'default';

	if (routePlannerContext.data.view_mode === 'destination-search' || routePlannerContext.data.view_mode === 'full-input') {
		return 'route-search';
	}

	if (routePlannerContext.data.view_mode === 'itinerary-detail') {
		const snapPoint = activeBottomSheetSnap.snapPoint ?? 0.28;
		if (snapPoint >= 0.9) return 'route-results-full';
		if (snapPoint >= 0.5) return 'route-results-medium';
		return 'route-results-compact';
	}

	if (routePlannerContext.data.view_mode === 'results') {
		const snapPoint = activeBottomSheetSnap.snapPoint ?? 0.24;
		if (snapPoint >= 0.9) return 'route-results-full';
		if (snapPoint >= 0.5) return 'route-results-medium';
		return 'route-results-short';
	}

	return 'default';

	//
}
