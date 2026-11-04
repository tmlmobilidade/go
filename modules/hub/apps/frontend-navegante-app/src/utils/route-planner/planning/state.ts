import { MAP_BOTTOM_SHEET_INITIAL_SNAP, MAP_BOTTOM_SHEET_SNAP_POINTS } from '@/constants/bottom-sheet';
import { type BottomSheetNavigationEntry } from '@/types/common/bottom-sheet';
import { type RoutePlannerLocation, type RoutePlannerLocationSearchReturnView, type RoutePlannerLocationSearchTarget, type RoutePlannerPlanViewMode, type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode, type RoutePlannerViewMode } from '@/types/route-planner/models';
import { type PersistedActiveTrip, type PersistedRoute } from '@/utils/persistence/app-state';
import { getRoutePlannerTravelTimeModeTransition } from '@/utils/route-planner/planning/navigation';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';

/* * */

export interface RoutePlannerState {
	activeTripItinerary: MotisItinerary | null
	destination: null | RoutePlannerLocation
	isNavigating: boolean
	isRestoringSessionRoute: boolean
	locationSearchReturnView: RoutePlannerLocationSearchReturnView
	locationSearchTarget: RoutePlannerLocationSearchTarget
	origin: null | RoutePlannerLocation
	pendingCurrentLocationRoute: null | PersistedRoute
	planError: null | string
	resultsInitialSnap: number
	selectedItineraryIndex: null | number
	travelTime: RoutePlannerTravelTime
	tripSheetHistory: BottomSheetNavigationEntry[]
	viewMode: RoutePlannerViewMode
	wasOpenedFromPlace: boolean
}

export type RoutePlannerStateAction =
  | { currentDate: Date, mode: RoutePlannerTravelTimeMode, type: 'set-travel-time-mode' }
  | { date: Date, type: 'set-travel-time' }
  | { destination: null | RoutePlannerLocation, origin: null | RoutePlannerLocation, pendingCurrentLocation: boolean, route: PersistedRoute, travelTime: RoutePlannerTravelTime, type: 'restore-route' }
  | { error: string, type: 'plan-error' }
  | { index: number, itinerary: MotisItinerary, sheetHistory: BottomSheetNavigationEntry[], type: 'start-trip' }
  | { index: number, type: 'preview-itinerary' }
  | { index: number, type: 'select-itinerary' }
  | { itineraryCount: number, route: PersistedRoute, type: 'restore-result' }
  | { location: RoutePlannerLocation, needsOrigin: boolean, type: 'open-directions' }
  | { location: RoutePlannerLocation, returnView: RoutePlannerLocationSearchReturnView, type: 'select-destination' }
  | { location: RoutePlannerLocation, type: 'open-place' }
  | { location: RoutePlannerLocation, type: 'refresh-current-location' }
  | { location: RoutePlannerLocation, type: 'select-origin' }
  | { location: RoutePlannerLocation, type: 'set-origin' }
  | { origin: null | RoutePlannerLocation, route: PersistedRoute, trip: PersistedActiveTrip, type: 'restore-active-trip' }
  | { returnView: RoutePlannerLocationSearchReturnView, type: 'require-origin' }
  | { target: RoutePlannerLocationSearchTarget, type: 'open-location-search' }
  | { type: 'clear-route' }
  | { type: 'end-trip' }
  | { type: 'invalidate-plan' }
  | { type: 'open-place-detail' }
  | { type: 'open-results' }
  | { type: 'open-trip-detail' }
  | { type: 'plan-started', viewMode: RoutePlannerPlanViewMode }
  | { type: 'restore-finished' }
  | { type: 'swap-locations' };

/* * */

export function createRoutePlannerState(): RoutePlannerState {
	return {
		activeTripItinerary: null,
		destination: null,
		isNavigating: false,
		isRestoringSessionRoute: false,
		locationSearchReturnView: 'results',
		locationSearchTarget: 'destination',
		origin: null,
		pendingCurrentLocationRoute: null,
		planError: null,
		resultsInitialSnap: MAP_BOTTOM_SHEET_INITIAL_SNAP,
		selectedItineraryIndex: 0,
		travelTime: { date: new Date(), mode: 'now' },
		tripSheetHistory: [],
		viewMode: 'destination-search',
		wasOpenedFromPlace: false,
	};
}

/* * */

export function routePlannerReducer(state: RoutePlannerState, action: RoutePlannerStateAction): RoutePlannerState {
	switch (action.type) {
		case 'clear-route':
			return { ...state, activeTripItinerary: null, destination: null, isNavigating: false, isRestoringSessionRoute: false, locationSearchReturnView: 'results', origin: null, pendingCurrentLocationRoute: null, planError: null, selectedItineraryIndex: 0, viewMode: 'destination-search', wasOpenedFromPlace: false };
		case 'end-trip':
			return { ...state, isNavigating: false, resultsInitialSnap: MAP_BOTTOM_SHEET_SNAP_POINTS.length - 1, tripSheetHistory: [], viewMode: 'results' };
		case 'invalidate-plan':
			return { ...state, activeTripItinerary: null, isRestoringSessionRoute: false, pendingCurrentLocationRoute: null, planError: null, selectedItineraryIndex: 0 };
		case 'open-directions':
			return action.needsOrigin
				? { ...state, destination: action.location, locationSearchReturnView: 'results', locationSearchTarget: 'origin', resultsInitialSnap: MAP_BOTTOM_SHEET_INITIAL_SNAP, viewMode: 'destination-search', wasOpenedFromPlace: false }
				: { ...state, resultsInitialSnap: MAP_BOTTOM_SHEET_INITIAL_SNAP, viewMode: 'results' };
		case 'open-location-search':
			return { ...state, locationSearchReturnView: state.viewMode === 'destination-search' ? state.locationSearchReturnView : state.viewMode === 'place-detail' ? 'place-detail' : 'results', locationSearchTarget: action.target, viewMode: 'destination-search' };
		case 'open-place':
			return { ...state, destination: action.location, locationSearchReturnView: 'place-detail', selectedItineraryIndex: null, viewMode: 'place-detail', wasOpenedFromPlace: true };
		case 'open-place-detail':
			return { ...state, selectedItineraryIndex: null, viewMode: 'place-detail' };
		case 'open-results':
			return { ...state, isNavigating: false, resultsInitialSnap: MAP_BOTTOM_SHEET_SNAP_POINTS.length - 1, viewMode: 'results' };
		case 'open-trip-detail':
			return { ...state, viewMode: 'itinerary-detail' };
		case 'plan-error':
			return { ...state, planError: action.error };
		case 'plan-started':
			return { ...state, isNavigating: false, isRestoringSessionRoute: false, pendingCurrentLocationRoute: null, planError: null, resultsInitialSnap: MAP_BOTTOM_SHEET_INITIAL_SNAP, selectedItineraryIndex: action.viewMode === 'place-detail' ? null : 0, viewMode: action.viewMode };
		case 'preview-itinerary':
			return { ...state, selectedItineraryIndex: action.index, viewMode: 'itinerary-detail' };
		case 'refresh-current-location':
			return {
				...state,
				destination: state.destination?.isCurrentLocation ? action.location : state.destination,
				origin: state.origin?.isCurrentLocation ? action.location : state.origin,
			};
		case 'require-origin':
			return { ...state, locationSearchReturnView: action.returnView, locationSearchTarget: 'origin', viewMode: 'destination-search' };
		case 'restore-active-trip':
			return { ...state, activeTripItinerary: action.trip.itinerary, destination: action.route.destination, isNavigating: true, isRestoringSessionRoute: false, origin: action.origin, pendingCurrentLocationRoute: null, planError: null, selectedItineraryIndex: 0, travelTime: { date: new Date(action.route.travelTime.date), mode: action.route.travelTime.mode }, tripSheetHistory: action.trip.sheetHistory.length > 0 ? action.trip.sheetHistory : [{ view: 'routes' }], viewMode: 'itinerary-detail' };
		case 'restore-finished':
			return { ...state, isRestoringSessionRoute: false, pendingCurrentLocationRoute: null };
		case 'restore-result': {
			const savedIndex = action.route.selectedItineraryIndex;
			const hasSavedItinerary = savedIndex !== null && savedIndex < action.itineraryCount;
			return {
				...state,
				selectedItineraryIndex: savedIndex !== null && !hasSavedItinerary ? 0 : state.selectedItineraryIndex,
				viewMode: action.route.viewMode === 'itinerary-detail' && hasSavedItinerary && state.viewMode === 'results' ? 'itinerary-detail' : state.viewMode,
			};
		}
		case 'restore-route': {
			const hasLocations = !!action.origin && !!action.destination;
			return {
				...state,
				activeTripItinerary: null,
				destination: action.destination,
				isNavigating: false,
				isRestoringSessionRoute: hasLocations || action.pendingCurrentLocation,
				locationSearchReturnView: action.route.viewMode === 'place-detail' ? 'place-detail' : 'results',
				locationSearchTarget: hasLocations ? action.route.locationSearchTarget : action.origin ? 'destination' : 'origin',
				origin: action.origin,
				pendingCurrentLocationRoute: action.pendingCurrentLocation ? action.route : null,
				planError: null,
				selectedItineraryIndex: action.route.selectedItineraryIndex ?? 0,
				travelTime: action.travelTime,
				viewMode: hasLocations ? action.route.viewMode === 'itinerary-detail' ? 'results' : action.route.viewMode : 'destination-search',
				wasOpenedFromPlace: action.route.viewMode === 'place-detail',
			};
		}
		case 'select-destination':
			return { ...state, destination: action.location, wasOpenedFromPlace: action.returnView === 'place-detail' };
		case 'select-itinerary':
			return { ...state, selectedItineraryIndex: action.index, viewMode: state.viewMode === 'place-detail' ? 'results' : state.viewMode };
		case 'select-origin':
			return state.destination
				? { ...state, origin: action.location }
				: { ...state, locationSearchReturnView: 'results', locationSearchTarget: 'destination', origin: action.location, viewMode: 'destination-search', wasOpenedFromPlace: false };
		case 'set-origin':
			return { ...state, origin: action.location };
		case 'set-travel-time':
			return { ...state, travelTime: { ...state.travelTime, date: action.date } };
		case 'set-travel-time-mode':
			return { ...state, travelTime: getRoutePlannerTravelTimeModeTransition(state.travelTime, action.mode, action.currentDate) };
		case 'start-trip':
			return { ...state, activeTripItinerary: action.itinerary, isNavigating: true, selectedItineraryIndex: action.index, tripSheetHistory: action.sheetHistory, viewMode: 'itinerary-detail' };
		case 'swap-locations':
			return { ...state, destination: state.origin, locationSearchReturnView: 'results', locationSearchTarget: !state.destination || !state.origin ? state.destination ? 'destination' : 'origin' : state.locationSearchTarget, origin: state.destination, viewMode: !state.destination || !state.origin ? 'destination-search' : state.viewMode, wasOpenedFromPlace: false };
	}
}
