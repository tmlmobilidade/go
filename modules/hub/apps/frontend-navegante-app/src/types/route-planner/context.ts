import { type BottomSheetNavigationEntry } from '@/types/common/bottom-sheet';
import { type RoutePlannerItineraryMapData, type RoutePlannerLocation, type RoutePlannerLocationSearchReturnView, type RoutePlannerLocationSearchTarget, type RoutePlannerPlanViewMode, type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode, type RoutePlannerViewMode } from '@/types/route-planner/models';
import { type PersistedActiveTrip, type PersistedRoute } from '@/utils/persistence/app-state';
import { type MotisItinerary } from '@tmlmobilidade/go-types-motis';

/* * */

export interface RoutePlannerPlanOptions {
	destination?: null | RoutePlannerLocation
	origin?: null | RoutePlannerLocation
	travelTime?: RoutePlannerTravelTime
	viewMode?: RoutePlannerPlanViewMode
}

export interface RoutePlannerContextState {
	actions: {
		clearRoute: () => void
		dismissTripSheets: () => void
		endActiveTrip: () => void
		openActiveTripDetail: () => void
		openDirectionsTo: (location: RoutePlannerLocation) => Promise<void>
		openLocationSearch: (target: RoutePlannerLocationSearchTarget) => void
		openPlace: (location: RoutePlannerLocation) => Promise<void>
		openPlaceDetail: () => void
		openResults: () => void
		planRoute: (options?: RoutePlannerPlanOptions) => Promise<void>
		previewItinerary: (index: number) => void
		restoreActiveTrip: (route: PersistedRoute, trip: PersistedActiveTrip) => void
		restoreSessionRoute: (route: PersistedRoute) => void
		selectCurrentLocation: (target: RoutePlannerLocationSearchTarget) => Promise<boolean>
		selectDestination: (location: RoutePlannerLocation) => Promise<void>
		selectItinerary: (index: number) => void
		selectOrigin: (location: RoutePlannerLocation) => Promise<void>
		setTravelTime: (date: Date) => void
		setTravelTimeMode: (mode: RoutePlannerTravelTimeMode) => void
		startItinerary: (index: number) => void
		swapLocations: () => void
	}
	data: {
		destination: null | RoutePlannerLocation
		has_pending_current_location_destination: boolean
		has_pending_current_location_origin: boolean
		itineraries: MotisItinerary[]
		location_search_return_view: RoutePlannerLocationSearchReturnView
		location_search_target: RoutePlannerLocationSearchTarget
		origin: null | RoutePlannerLocation
		plan_error: null | string
		results_initial_snap: number
		route_map_data: RoutePlannerItineraryMapData
		selected_itinerary: MotisItinerary | null
		selected_itinerary_index: null | number
		travel_time: RoutePlannerTravelTime
		trip_sheet_history: BottomSheetNavigationEntry[]
		view_mode: RoutePlannerViewMode
		was_opened_from_place: boolean
	}
	flags: {
		can_start_trip: boolean
		is_navigating: boolean
		is_planning: boolean
		is_restoring_session_route: boolean
	}
}
