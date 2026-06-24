import { HashedShape, HashedTrip, HashedTripWaypoint } from '@tmlmobilidade/types';

export interface AggregationResult {
	_id: string
	hashed_shape: HashedShape
	hashed_trip: Omit<HashedTrip, 'path'> & { path: (HashedTripWaypoint & { stop_codes: string[] })[] }
}

export interface TripStopWaypoint {
	latitude: number
	longitude: number
	stop_id: string
	timeDifference: number
}
