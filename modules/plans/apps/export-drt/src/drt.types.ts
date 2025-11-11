/* eslint-disable perfectionist/sort-interfaces */
/* * */

import { SQLiteDatabase, SQLiteTableInstance } from '@tmlmobilidade/sqlite';
import { OperationalDate, UnixTimestamp } from '@tmlmobilidade/types';

/* * */

export interface GlobalContext {
	configs: {
		agency_ids: string[]
		database_name: string
		database_path: string
		end_date: UnixTimestamp
		start_date: UnixTimestamp
	}
	database: InstanceType<typeof SQLiteDatabase>
	tables: DrtTables
}

/* * */
/* DRT TABLES */

export interface DrtTables {
	agencies: SQLiteTableInstance<DrtAgency>
	rides: SQLiteTableInstance<DrtRide>
	shapes: SQLiteTableInstance<DrtHashedShape>
	stops: SQLiteTableInstance<DrtStop>
	hashed_trips: SQLiteTableInstance<DrtHashedTrip>
}

export interface DrtHashedTrip {
	_id: string //  hashed_trip_id + stop_sequence + stop_id;
	hashed_trip_id: number

	/* * */

	stop_id: string
	stop_sequence: number
	shape_dist_traveled: number
	arrival_time: string
	departure_time: string
}

export interface DrtHashedShape {
	_id: string //  hashed_shape_id + shape_pt_sequence;
	hashed_shape_id: number

	/* * */

	meters_from_previous_stop: number
	meters_from_start: number
	meters_to_end: number
	meters_to_next_stop: number

	/* * */

	shape_dist_traveled: number
	shape_pt_lat: number
	shape_pt_lon: number
	shape_pt_sequence: number
}

export interface DrtRide {
	_id: string

	/* Ride */
	hashed_trip_id: number
	hashed_shape_id: number

	trip_id: string
	plan_id: string
	route_id: string
	pattern_id: string
	headsign: string

	operational_date: OperationalDate
	start_time_scheduled: UnixTimestamp
	end_time_scheduled: UnixTimestamp
	extension_scheduled: number

	agency_id: string

	/* DRT-specific */

	// driver_id: string
	// vehicle_id: string
	da_trip_number: number // Driver Assignment Trip Number
	va_trip_number: number // Vehicle Assignment Trip Number
}

export interface DrtStop {
	_id: string
	stop_name: string
	tts_name: string
	longitude: number
	latitude: number
	district_id: string
	locality_id: string
	municipality_id: string
	parish_id: string
}

export interface DrtAgency {
	_id: string
	agency_name: string
}
