'use client';

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useUserLocation } from '@/components/map/use-user-location';
import { buildMotisPlanParams, buildMotisProxyUrl, buildRoutePlannerItineraryMapData, getMotisItineraries, type MotisItinerary, type MotisPlanResponse, type RoutePlannerItineraryMapData, type RoutePlannerLocation, type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode } from '@/utils/route-planner-motis';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export type RoutePlannerLocationSearchTarget = 'destination' | 'origin';
type RoutePlannerViewMode = 'destination-search' | 'full-input' | 'itinerary-detail' | 'results';

interface RoutePlannerContextState {
	actions: {
		clearRoute: () => void
		openDestinationSearch: () => void
		openFullInput: () => void
		openItineraryDetail: (index: number) => void
		openLocationSearch: (target: RoutePlannerLocationSearchTarget) => void
		openResults: () => void
		planRoute: (nextOrigin?: null | RoutePlannerLocation, nextDestination?: null | RoutePlannerLocation) => Promise<void>
		selectDestination: (location: RoutePlannerLocation) => Promise<void>
		selectItinerary: (index: number) => void
		selectOrigin: (location: RoutePlannerLocation) => Promise<void>
		setDestination: (location: null | RoutePlannerLocation) => void
		setOrigin: (location: null | RoutePlannerLocation) => void
		setTravelTime: (date: Date) => void
		setTravelTimeMode: (mode: RoutePlannerTravelTimeMode) => void
		swapLocations: () => void
	}
	data: {
		destination: null | RoutePlannerLocation
		itineraries: MotisItinerary[]
		location_search_target: RoutePlannerLocationSearchTarget
		origin: null | RoutePlannerLocation
		plan: MotisPlanResponse | null
		plan_error: null | string
		route_map_data: RoutePlannerItineraryMapData
		selected_itinerary: MotisItinerary | null
		selected_itinerary_index: number
		travel_time: RoutePlannerTravelTime
		view_mode: RoutePlannerViewMode
	}
	flags: {
		has_plan_error: boolean
		is_planning: boolean
	}
}

/* * */

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
	const { setActiveBottomSheet } = useBottomSheet();
	const linesContext = useLinesContext();
	const { userLocation } = useUserLocation();

	const [destination, setDestinationState] = useState<null | RoutePlannerLocation>(null);
	const [origin, setOriginState] = useState<null | RoutePlannerLocation>(null);
	const [plan, setPlan] = useState<MotisPlanResponse | null>(null);
	const [planError, setPlanError] = useState<null | string>(null);
	const [isPlanning, setIsPlanning] = useState(false);
	const [selectedItineraryIndex, setSelectedItineraryIndex] = useState(0);
	const [travelTime, setTravelTimeState] = useState<RoutePlannerTravelTime>(() => ({ date: new Date(), mode: 'now' }));
	const [viewMode, setViewMode] = useState<RoutePlannerViewMode>('destination-search');
	const [locationSearchTarget, setLocationSearchTarget] = useState<RoutePlannerLocationSearchTarget>('destination');

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

	const buildOriginFromCoordinates = (latitude: number | undefined, longitude: number | undefined): null | RoutePlannerLocation => {
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

		const lat = Number(latitude.toFixed(6));
		const lon = Number(longitude.toFixed(6));

		return {
			detail: t('default:routes.RoutePlannerSearch.origin.current_location_detail'),
			label: t('default:routes.RoutePlannerSearch.origin.current_location'),
			lat,
			lon,
			type: 'PLACE',
		};
	};

	const buildUserLocationOrigin = (): null | RoutePlannerLocation => {
		if (!userLocation) return null;
		return buildOriginFromCoordinates(userLocation.latitude, userLocation.longitude);
	};

	const getCurrentBrowserLocationOrigin = async (): Promise<null | RoutePlannerLocation> => {
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
	};

	const clearRoute = () => {
		setDestinationState(null);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
		setViewMode('destination-search');
	};

	const openDestinationSearch = () => {
		openLocationSearch('destination');
	};

	const openLocationSearch = (target: RoutePlannerLocationSearchTarget) => {
		setLocationSearchTarget(target);
		setPlanError(null);
		setViewMode('destination-search');
		setActiveBottomSheet({ view: 'routes' }, { replace: true });
	};

	const openFullInput = () => {
		setViewMode('full-input');
		setPlanError(null);
		setActiveBottomSheet({ view: 'routes' }, { replace: true });
	};

	const openItineraryDetail = (index: number) => {
		setSelectedItineraryIndex(index);
		setViewMode('itinerary-detail');
		setActiveBottomSheet({ view: 'routes' }, { replace: true });
	};

	const openResults = () => {
		setViewMode('results');
		setActiveBottomSheet({ view: 'routes' }, { replace: true });
	};

	const planRoute = async (nextOrigin?: null | RoutePlannerLocation, nextDestination?: null | RoutePlannerLocation) => {
		const requestOrigin = nextOrigin === undefined ? origin : nextOrigin;
		const requestDestination = nextDestination === undefined ? destination : nextDestination;

		if (!requestOrigin || !requestDestination) {
			setPlanError(t('default:routes.RoutePlanner.errors.missing_locations'));
			return;
		}

		setIsPlanning(true);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);

		try {
			const response = await fetch(buildMotisProxyUrl('/api/v6/plan', buildMotisPlanParams(requestOrigin, requestDestination, travelTime)));

			if (!response.ok) throw new Error(`MOTIS returned HTTP ${response.status}`);

			const data: MotisPlanResponse = await response.json();
			const nextItineraries = getMotisItineraries(data);

			setPlan(data);
			setViewMode('results');

			if (nextItineraries.length === 0) {
				setPlanError(t('default:routes.RoutePlanner.errors.no_itineraries'));
			}
		} catch (caughtError) {
			const message = caughtError instanceof Error ? caughtError.message : t('default:routes.RoutePlanner.errors.unknown');
			setPlanError(message);
			setViewMode('results');
		} finally {
			setIsPlanning(false);
		}
	};

	const selectDestination = async (location: RoutePlannerLocation) => {
		setDestinationState(location);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);

		const nextOrigin = origin || buildUserLocationOrigin() || await getCurrentBrowserLocationOrigin();
		if (!nextOrigin) {
			setPlanError(t('default:routes.RoutePlanner.errors.location_unavailable'));
			setViewMode('full-input');
			return;
		}

		setOriginState(nextOrigin);
		await planRoute(nextOrigin, location);
	};

	const selectOrigin = async (location: RoutePlannerLocation) => {
		setOriginState(location);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);

		if (!destination) {
			setViewMode('full-input');
			return;
		}

		await planRoute(location, destination);
	};

	const selectItinerary = (index: number) => {
		setSelectedItineraryIndex(index);
	};

	const setDestination = (location: null | RoutePlannerLocation) => {
		setDestinationState(location);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
	};

	const setOrigin = (location: null | RoutePlannerLocation) => {
		setOriginState(location);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
	};

	const setTravelTime = (date: Date) => {
		setTravelTimeState(current => ({ ...current, date }));
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
	};

	const setTravelTimeMode = (mode: RoutePlannerTravelTimeMode) => {
		setTravelTimeState(current => ({
			date: mode === 'now' || current.mode === 'now' ? new Date() : current.date,
			mode,
		}));
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);
	};

	const swapLocations = () => {
		setOriginState(destination);
		setDestinationState(origin);
		setPlan(null);
		setPlanError(null);
		setSelectedItineraryIndex(0);

		if (origin && destination) {
			void planRoute(destination, origin);
		}
	};

	//
	// D. Render components

	return (
		<RoutePlannerContext.Provider
			value={{
				actions: {
					clearRoute,
					openDestinationSearch,
					openFullInput,
					openItineraryDetail,
					openLocationSearch,
					openResults,
					planRoute,
					selectDestination,
					selectItinerary,
					selectOrigin,
					setDestination,
					setOrigin,
					setTravelTime,
					setTravelTimeMode,
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
				},
				flags: {
					has_plan_error: !!planError,
					is_planning: isPlanning,
				},
			}}
		>
			{children}
		</RoutePlannerContext.Provider>
	);

	//
}
