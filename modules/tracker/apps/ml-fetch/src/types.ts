import { HashedShape, HashedTrip, HashedTripWaypoint } from '@tmlmobilidade/types';

export interface AggregationResult {
	_id: string
	hashed_shape: HashedShape
	hashed_trip: Omit<HashedTrip, 'path'> & { path: (HashedTripWaypoint & { stop_codes: string[] })[] }
	trip_id: string
}

export interface TripStopWaypoint {
	latitude: number
	longitude: number
	stop_id: string
	timeDifference: number
}

export interface TrainNextStop {
	arrival_seconds: number
	stop_id: string
}

export interface TrainPosition {
	destination_id: string
	next_stop: TrainNextStop
}

export type TrainPositionsMap = Map<string, TrainPosition>;
