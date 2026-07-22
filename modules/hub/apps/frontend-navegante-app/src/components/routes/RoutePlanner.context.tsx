'use client';

import { useLinesContext } from '@/components/lines/Lines.context';
import { useUserLocation } from '@/contexts/UserLocation.context';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { type RoutePlannerContextState } from '@/types/route-planner/context';
import { type MotisPlanResponse, type RoutePlannerLocation, type RoutePlannerLocationSearchTarget, type RoutePlannerPlanViewMode, type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode, type RoutePlannerViewMode } from '@/types/route-planner/models';
import { buildRoutePlannerItineraryMapData } from '@/utils/route-planner/itinerary/geometry';
import { createRoutePlannerCurrentLocation } from '@/utils/route-planner/planning/locations';
import { fetchMotisPlan, getMotisItineraries } from '@/utils/route-planner/planning/motis-plan-api';
import { getRoutePlannerPlanStartTransition, getRoutePlannerStartTripTransition, getRoutePlannerTravelTimeModeTransition } from '@/utils/route-planner/planning/navigation';
import { clearLastSearchQuery } from '@/utils/search/search-query';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWRMutation from 'swr/mutation';

/* * */

interface RoutePlanRequest {
	destination: RoutePlannerLocation
	origin: RoutePlannerLocation
	travelTime: RoutePlannerTravelTime
}

/* * */

const ROUTE_PLAN_KEY = 'route-planner/plan';

async function fetchRoutePlan(_key: string, { arg }: { arg: RoutePlanRequest }) {
	return fetchMotisPlan(arg.origin, arg.destination, arg.travelTime);
}

/* * */

export type { RoutePlannerLocationSearchTarget, RoutePlannerViewMode } from '@/types/route-planner/models';

const RoutePlannerContext = createContext<RoutePlannerContextState | undefined>(undefined);

export function useRoutePlannerContext() {
	const context = useContext(RoutePlannerContext);

	if (!context) {
		throw new Error('useRoutePlannerContext must be used within a RoutePlannerContextProvider');
	}

	return context;
}

/* * */

export function RoutePlannerContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { clearActiveBottomSheets, setActiveBottomSheet } = useBottomSheet();
	const linesContext = useLinesContext();
	const { userLocation } = useUserLocation();

	const [destination, setDestinationState] = useState<null | RoutePlannerLocation>(null);
	const [origin, setOriginState] = useState<null | RoutePlannerLocation>(null);
	const [plan, setPlan] = useState<MotisPlanResponse | null>(null);
	const [planError, setPlanError] = useState<null | string>(null);
	const [selectedItineraryIndex, setSelectedItineraryIndex] = useState<null | number>(0);
	const [travelTime, setTravelTimeState] = useState<RoutePlannerTravelTime>(() => ({ date: new Date(), mode: 'now' }));
	const [viewMode, setViewMode] = useState<RoutePlannerViewMode>('destination-search');
	const [locationSearchTarget, setLocationSearchTarget] = useState<RoutePlannerLocationSearchTarget>('destination');
	const [wasOpenedFromPlace, setWasOpenedFromPlace] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const {
		isMutating: isPlanning,
		reset: resetPlanRequest,
		trigger: triggerPlanRequest,
	} = useSWRMutation<MotisPlanResponse, Error, string, RoutePlanRequest>(ROUTE_PLAN_KEY, fetchRoutePlan, { throwOnError: false });

	//
	// B. Transform data

	const itineraries = useMemo(() => getMotisItineraries(plan), [plan]);
	const selectedItinerary = itineraries[selectedItineraryIndex] ?? null;

	const routeMapData = useMemo(() => {
		const lineStyleByShortName = new Map(
			linesContext.data.lines.map(line => [
				line.short_name,
				{
					color: line.color,
					text_color: line.text_color,
				},
			]),
		);

		return buildRoutePlannerItineraryMapData(selectedItinerary, origin, destination, { lineStyleByShortName });
	}, [destination, linesContext.data.lines, origin, selectedItinerary]);

	//
	// C. Handle actions

	const buildOriginFromCoordinates = useCallback((latitude: number | undefined, longitude: number | undefined): null | RoutePlannerLocation => {
		return createRoutePlannerCurrentLocation({
			detail: t('default:routes.RoutePlannerSearch.origin.current_location_detail'),
			label: t('default:routes.RoutePlannerSearch.origin.current_location'),
			latitude,
			longitude,
		});
	}, [t]);

	const buildUserLocationOrigin = useCallback((): null | RoutePlannerLocation => {
		if (!userLocation) return null;
		return buildOriginFromCoordinates(userLocation.latitude, userLocation.longitude);
	}, [buildOriginFromCoordinates, userLocation]);

	const getCurrentBrowserLocationOrigin = useCallback(async (): Promise<null | RoutePlannerLocation> => {
		if (typeof navigator === 'undefined' || !navigator.geolocation) return null;

		return new Promise((resolve) => {
			navigator.geolocation.getCurrentPosition(
				position => resolve(buildOriginFromCoordinates(position.coords.latitude, position.coords.longitude)),
				() => resolve(null),
				{
					enableHighAccuracy: true,
					maximumAge: 30_000,
					timeout: 10_000,
				},
			);
		});
	}, [buildOriginFromCoordinates]);

	const clearRoute = useCallback(() => {
		resetPlanRequest();
		setOriginState(null);
		setDestinationState(null);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
		setViewMode('destination-search');
		setWasOpenedFromPlace(false);
		setIsNavigating(false);
	}, [resetPlanRequest]);

	const planRoute = useCallback(async (nextOrigin?: null | RoutePlannerLocation, nextDestination?: null | RoutePlannerLocation, nextTravelTime?: RoutePlannerTravelTime, nextViewMode: RoutePlannerPlanViewMode = 'results') => {
		const requestOrigin = nextOrigin === undefined ? origin : nextOrigin;
		const requestDestination = nextDestination === undefined ? destination : nextDestination;
		const requestTravelTime = nextTravelTime ?? travelTime;

		if (!requestOrigin || !requestDestination) {
			resetPlanRequest();
			setPlanError(t('default:routes.RoutePlanner.errors.missing_locations'));
			return;
		}

		const transition = getRoutePlannerPlanStartTransition(nextViewMode);

		setPlan(null);
		setPlanError(null);
		setIsNavigating(transition.isNavigating);
		setSelectedItineraryIndex(transition.selectedItineraryIndex);
		setViewMode(transition.viewMode);

		await triggerPlanRequest(
			{
				destination: requestDestination,
				origin: requestOrigin,
				travelTime: requestTravelTime,
			},
			{
				onError: (caughtError) => {
					setPlanError(caughtError.message || t('default:routes.RoutePlanner.errors.unknown'));
					setViewMode(nextViewMode);
				},
				onSuccess: (data) => {
					setPlan(data);

					if (getMotisItineraries(data).length === 0) {
						setPlanError(t('default:routes.RoutePlanner.errors.no_itineraries'));
					}
				},
				throwOnError: false,
			},
		);
	}, [destination, origin, resetPlanRequest, t, travelTime, triggerPlanRequest]);

	const startItinerary = useCallback((index: number) => {
		const transition = getRoutePlannerStartTripTransition(index);

		setSelectedItineraryIndex(transition.selectedItineraryIndex);
		setIsNavigating(transition.isNavigating);
		setViewMode(transition.viewMode);
		clearActiveBottomSheets();
	}, [clearActiveBottomSheets]);

	const endActiveTrip = useCallback(() => {
		clearRoute();
		clearLastSearchQuery();
		clearActiveBottomSheets();
	}, [clearActiveBottomSheets, clearRoute]);

	const dismissTripSheets = useCallback(() => {
		clearActiveBottomSheets();
	}, [clearActiveBottomSheets]);

	const openActiveTripDetail = useCallback(() => {
		setViewMode('itinerary-detail');
		setActiveBottomSheet({ view: 'routes' }, { replace: true });
	}, [setActiveBottomSheet]);

	const openLocationSearch = useCallback((target: RoutePlannerLocationSearchTarget) => {
		setLocationSearchTarget(target);
		setViewMode('destination-search');
		setActiveBottomSheet({ view: 'routes' }, { replace: true });
	}, [setActiveBottomSheet]);

	const openDestinationSearch = useCallback(() => {
		openLocationSearch('destination');
	}, [openLocationSearch]);

	const openFullInput = useCallback(() => {
		setViewMode('full-input');
		setPlanError(null);
		setWasOpenedFromPlace(false);
		setActiveBottomSheet({ view: 'routes' }, { replace: true });
	}, [setActiveBottomSheet]);

	const openResults = useCallback(() => {
		setIsNavigating(false);
		setViewMode('results');
	}, []);

	const openPlace = useCallback(async (location: RoutePlannerLocation) => {
		resetPlanRequest();
		setDestinationState(location);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(null);
		setViewMode('place-detail');
		setWasOpenedFromPlace(true);
		setActiveBottomSheet({ view: 'routes' });

		const nextOrigin = origin || buildUserLocationOrigin() || await getCurrentBrowserLocationOrigin();
		if (!nextOrigin) {
			setPlanError(t('default:routes.RoutePlanner.errors.location_unavailable'));
			setViewMode('full-input');
			return;
		}

		setOriginState(nextOrigin);
		await planRoute(nextOrigin, location, undefined, 'place-detail');
	}, [buildUserLocationOrigin, getCurrentBrowserLocationOrigin, origin, planRoute, resetPlanRequest, setActiveBottomSheet, t]);

	const openPlaceDetail = useCallback(() => {
		setSelectedItineraryIndex(null);
		setViewMode('place-detail');
	}, []);

	const selectDestination = useCallback(async (location: RoutePlannerLocation) => {
		resetPlanRequest();
		setDestinationState(location);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
		setWasOpenedFromPlace(false);

		const nextOrigin = origin || buildUserLocationOrigin() || await getCurrentBrowserLocationOrigin();
		if (!nextOrigin) {
			setPlanError(t('default:routes.RoutePlanner.errors.location_unavailable'));
			setViewMode('full-input');
			return;
		}

		setOriginState(nextOrigin);
		await planRoute(nextOrigin, location);
	}, [buildUserLocationOrigin, getCurrentBrowserLocationOrigin, origin, planRoute, resetPlanRequest, t]);

	const openDirectionsTo = useCallback(async (location: RoutePlannerLocation) => {
		setViewMode('results');
		setActiveBottomSheet({ view: 'routes' });
		await selectDestination(location);
	}, [selectDestination, setActiveBottomSheet]);

	const selectOrigin = useCallback(async (location: RoutePlannerLocation) => {
		resetPlanRequest();
		setOriginState(location);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);

		if (!destination) {
			setViewMode('full-input');
			return;
		}

		await planRoute(location, destination);
	}, [destination, planRoute, resetPlanRequest]);

	const selectItinerary = useCallback((index: number) => {
		setSelectedItineraryIndex(index);
		if (viewMode === 'place-detail') setViewMode('results');
	}, [viewMode]);

	const setDestination = useCallback((location: null | RoutePlannerLocation) => {
		resetPlanRequest();
		setDestinationState(location);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
	}, [resetPlanRequest]);

	const setOrigin = useCallback((location: null | RoutePlannerLocation) => {
		resetPlanRequest();
		setOriginState(location);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
	}, [resetPlanRequest]);

	const setTravelTime = useCallback((date: Date) => {
		resetPlanRequest();
		setTravelTimeState(current => ({ ...current, date }));
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
	}, [resetPlanRequest]);

	const setTravelTimeMode = useCallback((mode: RoutePlannerTravelTimeMode) => {
		resetPlanRequest();
		setTravelTimeState(current => getRoutePlannerTravelTimeModeTransition(current, mode));
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
	}, [resetPlanRequest]);

	const swapLocations = useCallback(() => {
		resetPlanRequest();
		setOriginState(destination);
		setDestinationState(origin);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);

		if (origin && destination) {
			void planRoute(destination, origin);
		}
	}, [destination, origin, planRoute, resetPlanRequest]);

	useEffect(() => {
		return () => resetPlanRequest();
	}, [resetPlanRequest]);

	//
	// D. Define context value

	const contextValue = useMemo<RoutePlannerContextState>(() => ({
		actions: {
			clearRoute,
			dismissTripSheets,
			endActiveTrip,
			openActiveTripDetail,
			openDestinationSearch,
			openDirectionsTo,
			openFullInput,
			openLocationSearch,
			openPlace,
			openPlaceDetail,
			openResults,
			planRoute,
			selectDestination,
			selectItinerary,
			selectOrigin,
			setDestination,
			setOrigin,
			setTravelTime,
			setTravelTimeMode,
			startItinerary,
			swapLocations,
		},
		data: {
			destination,
			itineraries,
			location_search_target: locationSearchTarget,
			origin,
			plan,
			plan_error: planError,
			route_map_data: routeMapData,
			selected_itinerary: selectedItinerary,
			selected_itinerary_index: selectedItineraryIndex,
			travel_time: travelTime,
			view_mode: viewMode,
			was_opened_from_place: wasOpenedFromPlace,
		},
		flags: {
			has_plan_error: !!planError,
			is_navigating: isNavigating,
			is_planning: isPlanning,
		},
	}), [clearRoute, destination, dismissTripSheets, endActiveTrip, isNavigating, isPlanning, itineraries, locationSearchTarget, openActiveTripDetail, openDestinationSearch, openDirectionsTo, openFullInput, openLocationSearch, openPlace, openPlaceDetail, openResults, origin, plan, planError, planRoute, routeMapData, selectDestination, selectedItinerary, selectedItineraryIndex, selectItinerary, selectOrigin, setDestination, setOrigin, setTravelTime, setTravelTimeMode, startItinerary, swapLocations, travelTime, viewMode, wasOpenedFromPlace]);

	//
	// E. Render components

	return (
		<RoutePlannerContext.Provider value={contextValue}>
			{children}
		</RoutePlannerContext.Provider>
	);

	//
}
