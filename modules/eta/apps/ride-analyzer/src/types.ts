/* * */

import type { TripRef } from '@/parse-trip-ref.js';
import type { SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

export interface CliArgs {
	lineIds: number[]
	outputDir: string
	skipLoader: boolean
	timeStartMs: number
	/** Raw `--trip-id` argument (ride id or trip id). */
	tripIdInput: string
	tripRef: TripRef
}

export interface EnrichedEta {
	current_node_index: number
	estimated_arrival: null | string
	estimated_arrival_unix: null | number
	eta_seconds: null | number
	headsign: null | string
	line_id: string
	observed_arrival: null | string
	observed_arrival_unix: null | number
	pattern_id: string
	position_created_at: number
	route_id: string
	scheduled_arrival: null | string
	scheduled_arrival_unix: null | number
	stop_id: string
	stop_node_index: number
	stop_sequence: number
	trip_id: string
	vehicle_id: string
}

export interface CurrVehicleEvent {
	_id: string
	bearing: null | number
	created_at: number
	hashed_shape_id: string
	latitude: number
	longitude: number
	node_index: number
	speed: null | number
	trip_id: string
	vehicle_id: string
}

export interface ReplaySnapshot {
	curr_vehicle_event: CurrVehicleEvent | null
	etas: EnrichedEta[]
	event: SimplifiedVehicleEvent
	event_index: number
}

export interface RouteNode {
	latitude: number
	longitude: number
	node_index: number
}

export interface StopWaypoint {
	arrival_time: string
	departure_time: string
	hashed_shape_id: string
	hashed_trip_id: string
	node_index: number
	stop_id: string
	stop_lat: number
	stop_lon: number
	stop_name: string
	stop_sequence: number
}

export interface TripContext {
	hashedShapeId: string
	hashedTripId: string
}
