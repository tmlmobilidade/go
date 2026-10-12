'use client';

import { useLinesData } from '@/components/lines/use-lines-data';
import { useUserLocation } from '@/contexts/UserLocation.context';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useRoutePlannerPlanning } from '@/hooks/route-planner/useRoutePlannerPlanning';
import { type RoutePlannerContextState } from '@/types/route-planner/context';
import { type RoutePlannerLocation, type RoutePlannerLocationSearchTarget, type RoutePlannerTravelTimeMode } from '@/types/route-planner/models';
import { buildRoutePlannerItineraryMapData } from '@/utils/route-planner/itinerary/geometry';
import { createRoutePlannerState, routePlannerReducer } from '@/utils/route-planner/planning/state';
import { clearSearchDraft } from '@/utils/search/search-draft';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

/* * */

export type { RoutePlannerLocationSearchTarget, RoutePlannerViewMode } from '@/types/route-planner/models';

const RoutePlannerContext = createContext<RoutePlannerContextState | undefined>(undefined);

export function useRoutePlannerContext(): RoutePlannerContextState {
	const context = useContext(RoutePlannerContext);
	if (!context) throw new Error('useRoutePlannerContext must be used within a RoutePlannerContextProvider');
	return context;
}

/* * */

export function RoutePlannerContextProvider({ children }: PropsWithChildren) {
	// A. Compose planner state and dependencies

	const [state, dispatch] = useReducer(routePlannerReducer, undefined, createRoutePlannerState);
	const { activeBottomSheet, bottomSheetNavigation, pop, push, replaceActive, restore, suspend } = useBottomSheet();
	const { actions: { enableBearingTracking } } = useUserLocation();
	const { cachedOrigin, cancelActiveTripRestore, invalidatePlanResult, isPlanning, itineraries, planRoute, requestCurrentOrigin, resolveOrigin, restoreActiveTrip, restoreSessionRoute } = useRoutePlannerPlanning({ dispatch, state });
	const { activeTripItinerary, destination, isNavigating, locationSearchReturnView, origin, selectedItineraryIndex, tripSheetHistory, viewMode } = state;
	const hadRouteSheetRef = useRef(false);

	const availableItineraries = useMemo(() => itineraries.length > 0 ? itineraries : activeTripItinerary ? [activeTripItinerary] : itineraries, [activeTripItinerary, itineraries]);
	const selectedItinerary = isNavigating && activeTripItinerary ? activeTripItinerary : selectedItineraryIndex === null ? null : availableItineraries[selectedItineraryIndex] ?? null;
	const { linesByShortName } = useLinesData();
	const routeMapData = useMemo(() => buildRoutePlannerItineraryMapData(selectedItinerary, origin, destination, { lineStyleByShortName: linesByShortName }), [destination, linesByShortName, origin, selectedItinerary]);

	// B. Coordinate views and sheets

	const openRouteSheet = useCallback(() => {
		if (activeBottomSheet?.view === 'routes') replaceActive({ view: 'routes' });
		else push({ view: 'routes' });
	}, [activeBottomSheet?.view, push, replaceActive]);

	const clearRoute = useCallback(() => {
		cancelActiveTripRestore();
		invalidatePlanResult();
		dispatch({ type: 'clear-route' });
	}, [cancelActiveTripRestore, invalidatePlanResult]);

	const openActiveTripDetail = useCallback(() => {
		dispatch({ type: 'open-trip-detail' });
		openRouteSheet();
	}, [openRouteSheet]);

	const openLocationSearch = useCallback((target: RoutePlannerLocationSearchTarget) => {
		dispatch({ target, type: 'open-location-search' });
		openRouteSheet();
	}, [openRouteSheet]);

	const openResults = useCallback(() => dispatch({ type: 'open-results' }), []);
	const openPlaceDetail = useCallback(() => dispatch({ type: 'open-place-detail' }), []);
	const selectItinerary = useCallback((index: number) => dispatch({ index, type: 'select-itinerary' }), []);
	const previewItinerary = useCallback((index: number) => dispatch({ index, type: 'preview-itinerary' }), []);
	const dismissTripSheets = useCallback(() => {
		pop();
	}, [pop]);

	// C. Edit endpoints and travel time

	const openPlace = useCallback(async (location: RoutePlannerLocation) => {
		invalidatePlanResult();
		dispatch({ location, type: 'open-place' });
		openRouteSheet();
		const nextOrigin = await resolveOrigin(origin);
		if (!nextOrigin) {
			dispatch({ returnView: 'place-detail', type: 'require-origin' });
			return;
		}
		dispatch({ location: nextOrigin, type: 'set-origin' });
		await planRoute({ destination: location, origin: nextOrigin, viewMode: 'place-detail' });
	}, [invalidatePlanResult, openRouteSheet, origin, planRoute, resolveOrigin]);

	const selectDestination = useCallback(async (location: RoutePlannerLocation) => {
		const nextViewMode = viewMode === 'destination-search' ? locationSearchReturnView : 'results';
		invalidatePlanResult();
		dispatch({ location, returnView: nextViewMode, type: 'select-destination' });
		const nextOrigin = await resolveOrigin(origin);
		if (!nextOrigin) {
			dispatch({ returnView: nextViewMode, type: 'require-origin' });
			return;
		}
		dispatch({ location: nextOrigin, type: 'set-origin' });
		await planRoute({ destination: location, origin: nextOrigin, viewMode: nextViewMode });
	}, [invalidatePlanResult, locationSearchReturnView, origin, planRoute, resolveOrigin, viewMode]);

	const openDirectionsTo = useCallback(async (location: RoutePlannerLocation) => {
		const needsOrigin = !origin && !cachedOrigin;
		if (needsOrigin) invalidatePlanResult();
		dispatch({ location, needsOrigin, type: 'open-directions' });
		openRouteSheet();
		if (!needsOrigin) await selectDestination(location);
	}, [cachedOrigin, invalidatePlanResult, openRouteSheet, origin, selectDestination]);

	const selectOrigin = useCallback(async (location: RoutePlannerLocation) => {
		const nextViewMode = viewMode === 'destination-search' ? locationSearchReturnView : 'results';
		invalidatePlanResult();
		dispatch({ location, type: 'select-origin' });
		if (destination) await planRoute({ destination, origin: location, viewMode: nextViewMode });
	}, [destination, invalidatePlanResult, locationSearchReturnView, planRoute, viewMode]);

	const selectCurrentLocation = useCallback(async (target: RoutePlannerLocationSearchTarget) => {
		const location = cachedOrigin ?? await requestCurrentOrigin();
		if (!location) return false;
		if (target === 'origin') await selectOrigin(location);
		else await selectDestination(location);
		return true;
	}, [cachedOrigin, requestCurrentOrigin, selectDestination, selectOrigin]);

	const setTravelTime = useCallback((date: Date) => {
		invalidatePlanResult();
		dispatch({ date, type: 'set-travel-time' });
	}, [invalidatePlanResult]);

	const setTravelTimeMode = useCallback((mode: RoutePlannerTravelTimeMode) => {
		invalidatePlanResult();
		dispatch({ currentDate: new Date(), mode, type: 'set-travel-time-mode' });
	}, [invalidatePlanResult]);

	const swapLocations = useCallback(() => {
		invalidatePlanResult();
		dispatch({ type: 'swap-locations' });
		if (destination && origin) void planRoute({ destination: origin, origin: destination });
	}, [destination, invalidatePlanResult, origin, planRoute]);

	// D. Coordinate active trips and route dismissal

	const startItinerary = useCallback((index: number) => {
		if (!origin?.isCurrentLocation || !itineraries[index]) return;
		void enableBearingTracking();
		cancelActiveTripRestore();
		dispatch({ index, itinerary: itineraries[index], sheetHistory: suspend(), type: 'start-trip' });
	}, [cancelActiveTripRestore, enableBearingTracking, itineraries, origin, suspend]);

	const endActiveTrip = useCallback(() => {
		cancelActiveTripRestore();
		dispatch({ type: 'end-trip' });
		restore(tripSheetHistory.length > 0 ? tripSheetHistory : [{ view: 'routes' }]);
	}, [cancelActiveTripRestore, restore, tripSheetHistory]);

	useEffect(() => {
		if (bottomSheetNavigation.some(entry => entry.view === 'routes')) {
			hadRouteSheetRef.current = true;
			return;
		}
		if (isNavigating) return;
		clearSearchDraft();
		if (!hadRouteSheetRef.current) return;
		hadRouteSheetRef.current = false;
		clearRoute();
	}, [bottomSheetNavigation, clearRoute, isNavigating]);

	// E. Expose the public context contract

	const actions = useMemo<RoutePlannerContextState['actions']>(() => ({ clearRoute, dismissTripSheets, endActiveTrip, openActiveTripDetail, openDirectionsTo, openLocationSearch, openPlace, openPlaceDetail, openResults, planRoute, previewItinerary, restoreActiveTrip, restoreSessionRoute, selectCurrentLocation, selectDestination, selectItinerary, selectOrigin, setTravelTime, setTravelTimeMode, startItinerary, swapLocations }), [clearRoute, dismissTripSheets, endActiveTrip, openActiveTripDetail, openDirectionsTo, openLocationSearch, openPlace, openPlaceDetail, openResults, planRoute, previewItinerary, restoreActiveTrip, restoreSessionRoute, selectCurrentLocation, selectDestination, selectItinerary, selectOrigin, setTravelTime, setTravelTimeMode, startItinerary, swapLocations]);
	const data = useMemo<RoutePlannerContextState['data']>(() => ({
		destination: state.destination,
		has_pending_current_location_destination: state.pendingCurrentLocationRoute?.destinationUsesCurrentLocation === true,
		has_pending_current_location_origin: state.pendingCurrentLocationRoute?.originUsesCurrentLocation === true,
		itineraries: availableItineraries,
		location_search_return_view: state.locationSearchReturnView,
		location_search_target: state.locationSearchTarget,
		origin: state.origin,
		plan_error: state.planError,
		results_initial_snap: state.resultsInitialSnap,
		route_map_data: routeMapData,
		selected_itinerary: selectedItinerary,
		selected_itinerary_index: state.selectedItineraryIndex,
		travel_time: state.travelTime,
		trip_sheet_history: state.tripSheetHistory,
		view_mode: state.viewMode,
		was_opened_from_place: state.wasOpenedFromPlace,
	}), [availableItineraries, routeMapData, selectedItinerary, state]);
	const flags = useMemo<RoutePlannerContextState['flags']>(() => ({ can_start_trip: origin?.isCurrentLocation === true, is_navigating: isNavigating, is_planning: isPlanning, is_restoring_session_route: state.isRestoringSessionRoute }), [isNavigating, isPlanning, origin?.isCurrentLocation, state.isRestoringSessionRoute]);

	const contextValue = useMemo(() => ({ actions, data, flags }), [actions, data, flags]);

	// F. Render the provider

	return (
		<RoutePlannerContext.Provider value={contextValue}>
			{children}
		</RoutePlannerContext.Provider>
	);
}
