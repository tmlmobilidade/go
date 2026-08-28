import { type EncodedPolyline } from '@tmlmobilidade/go-types-geo';
import { type HashedTrip } from '@tmlmobilidade/go-types-operation';

export type TripPathWaypoint = HashedTrip & { stop_codes: string[] };

export const ML_AGENCY_ID = 'IA2N9';

export interface AggregationResult {
	_id: string
	hashed_trip: { path: TripPathWaypoint[] }
	shape_polyline: EncodedPolyline
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
