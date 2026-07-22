import { type MotisItinerary, type MotisPlanResponse, type RoutePlannerItineraryMapData, type RoutePlannerLocation, type RoutePlannerLocationSearchTarget, type RoutePlannerPlanViewMode, type RoutePlannerTravelTime, type RoutePlannerTravelTimeMode, type RoutePlannerViewMode } from '@/types/route-planner/models';

/* * */

export interface RoutePlannerContextState {
	actions: {
		clearRoute: () => void
		dismissTripSheets: () => void
		endActiveTrip: () => void
		openActiveTripDetail: () => void
		openDestinationSearch: () => void
		openDirectionsTo: (location: RoutePlannerLocation) => Promise<void>
		openFullInput: () => void
		openLocationSearch: (target: RoutePlannerLocationSearchTarget) => void
		openPlace: (location: RoutePlannerLocation) => Promise<void>
		openPlaceDetail: () => void
		openResults: () => void
		planRoute: (nextOrigin?: null | RoutePlannerLocation, nextDestination?: null | RoutePlannerLocation, nextTravelTime?: RoutePlannerTravelTime, nextViewMode?: RoutePlannerPlanViewMode) => Promise<void>
		selectDestination: (location: RoutePlannerLocation) => Promise<void>
		selectItinerary: (index: number) => void
		selectOrigin: (location: RoutePlannerLocation) => Promise<void>
		setDestination: (location: null | RoutePlannerLocation) => void
		setOrigin: (location: null | RoutePlannerLocation) => void
		setTravelTime: (date: Date) => void
		setTravelTimeMode: (mode: RoutePlannerTravelTimeMode) => void
		startItinerary: (index: number) => void
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
		selected_itinerary_index: null | number
		travel_time: RoutePlannerTravelTime
		view_mode: RoutePlannerViewMode
		was_opened_from_place: boolean
	}
	flags: {
		has_plan_error: boolean
		is_navigating: boolean
		is_planning: boolean
	}
}
