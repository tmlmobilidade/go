/* * */

import { type UnixTimestamp } from '@/_common/unix-timestamp.js';
import { type GTFS_PickupDropoffType } from '@/gtfs/common.js';

/* * */

export interface HashedTripWaypoint {
	arrival_time: string
	departure_time: string
	drop_off_type: GTFS_PickupDropoffType
	pickup_type: GTFS_PickupDropoffType
	shape_dist_traveled: number
	stop_id: string
	stop_lat: number
	stop_lon: number
	stop_name: string
	stop_sequence: number
	timepoint: number
}

/* * */

export interface HashedTrip {
	_id: string
	agency_id: string
	created_at: UnixTimestamp
	line_id: number
	line_long_name: string
	line_short_name: string
	path: HashedTripWaypoint[]
	pattern_id: string
	route_color: string
	route_id: string
	route_long_name: string
	route_short_name: string
	route_text_color: string
	trip_headsign: string
	updated_at: UnixTimestamp
}
