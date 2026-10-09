'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { readPersistedAppSession, toPersistedRouteLocation, writePersistedAppSession } from '@/utils/persistence/app-state';
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react';

/* * */

export function AppStatePersistence({ isMapFiltersOpen, setIsMapFiltersOpen }: { isMapFiltersOpen: boolean, setIsMapFiltersOpen: Dispatch<SetStateAction<boolean>> }) {
	//

	//
	// A. Setup variables

	const routePlanner = useRoutePlannerContext();
	const { activeBottomSheetSnap, bottomSheetNavigation, restore } = useBottomSheet();
	const [isRestored, setIsRestored] = useState(false);
	const didRestoreRef = useRef(false);
	const { destination, has_pending_current_location_destination: hasPendingCurrentLocationDestination, has_pending_current_location_origin: hasPendingCurrentLocationOrigin, location_search_target: locationSearchTarget, origin, selected_itinerary: selectedItinerary, selected_itinerary_index: selectedItineraryIndex, travel_time: travelTime, trip_sheet_history: tripSheetHistory, view_mode: viewMode } = routePlanner.data;
	const hasRouteSheet = bottomSheetNavigation.some(entry => entry.view === 'routes');
	const isNavigating = routePlanner.flags.is_navigating;

	//
	// B. Restore and save state

	useEffect(() => {
		if (didRestoreRef.current) return;
		didRestoreRef.current = true;
		const saved = readPersistedAppSession();
		if (saved) {
			if (saved.route && saved.activeTrip) routePlanner.actions.restoreActiveTrip(saved.route, saved.activeTrip);
			else if (saved.route && saved.sheets.some(entry => entry.view === 'routes')) routePlanner.actions.restoreSessionRoute(saved.route);
			restore(saved.sheets, saved.snapIndex);
			setIsMapFiltersOpen(saved.isMapFiltersOpen);
		}
		setIsRestored(true);
	}, [restore, routePlanner.actions, setIsMapFiltersOpen]);

	useEffect(() => {
		if (!isRestored || routePlanner.flags.is_restoring_session_route) return;
		writePersistedAppSession({
			activeTrip: isNavigating && selectedItinerary ? { itinerary: selectedItinerary, sheetHistory: tripSheetHistory } : null,
			isMapFiltersOpen,
			route: hasRouteSheet || isNavigating ? {
				destination: toPersistedRouteLocation(destination),
				destinationUsesCurrentLocation: destination?.isCurrentLocation === true || hasPendingCurrentLocationDestination,
				locationSearchTarget,
				origin: toPersistedRouteLocation(origin),
				originUsesCurrentLocation: origin?.isCurrentLocation === true || hasPendingCurrentLocationOrigin || isNavigating,
				selectedItineraryIndex,
				travelTime: { date: travelTime.date.toISOString(), mode: travelTime.mode },
				viewMode,
			} : null,
			sheets: bottomSheetNavigation,
			snapIndex: activeBottomSheetSnap.snapIndex,
		});
	}, [activeBottomSheetSnap.snapIndex, bottomSheetNavigation, destination, hasPendingCurrentLocationDestination, hasPendingCurrentLocationOrigin, hasRouteSheet, isMapFiltersOpen, isNavigating, isRestored, locationSearchTarget, origin, routePlanner.flags.is_restoring_session_route, selectedItinerary, selectedItineraryIndex, travelTime, tripSheetHistory, viewMode]);

	return null;
}
