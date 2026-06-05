/* * */

import type { Feature, LineString } from 'geojson';

/* * */

export type TransportOption = 'boat' | 'bus' | 'metro' | 'train';

/* * */

export interface Line {
	agency_id: string
	color: string
	district_ids: string[]
	facilities: string[]
	id: string
	locality_ids: string[]
	long_name: string
	municipality_ids: string[]
	pattern_ids: string[]
	region_ids: string[]
	route_ids: string[]
	short_name: string
	stop_ids: string[]
	text_color: string
	tts_name: string
}

/* * */

export interface NetworkRoute {
	agency_id: string
	color: string
	district_ids: string[]
	facilities: string[]
	id: string
	line_id: string
	locality_ids: string[]
	long_name: string
	municipality_ids: string[]
	pattern_ids: string[]
	region_ids: string[]
	short_name: string
	stop_ids: string[]
	text_color: string
	tts_name: string
}

/* * */

export interface NetworkPattern {
	agency_id: string
	color: string
	direction_id: 0 | 1
	district_ids: string[]
	facilities: string[]
	headsign: string
	id: string
	line_id: string
	locality_ids: string[]
	long_name: string
	municipality_ids: string[]
	path: Waypoint[]
	region_ids: string[]
	route_id: string
	shape_id: string
	short_name: string
	text_color: string
	trips: NetworkTrip[]
	tts_headsign: string
	valid_on: string[]
	version_id: string
}

export interface Waypoint {
	allow_drop_off: boolean
	allow_pickup: boolean
	distance: number
	distance_delta: number
	stop_id: string
	stop_sequence: number
}

export interface NetworkTrip {
	schedule: Arrival[]
	service_ids: string[]
	trip_ids: string[]
	valid_on: string[]
	version_id: string
}

export interface Arrival {
	arrival_time: string
	arrival_time_24h: string
	stop_id: string
	stop_sequence: number
}

/* * */

export interface NetworkShape {
	extension: number
	geojson: Feature<LineString>
	points: ShapePoint[]
	shape_id: string
}

export interface ShapePoint {
	shape_dist_traveled: number
	shape_pt_lat: number
	shape_pt_lon: number
	shape_pt_sequence: number
}

/* * */

export interface NetworkDate {
	day_type: DateDayType
	description: string
	holiday: boolean
	id: string
	period_id: string
}

export enum DateDayType {
	saturday = 'saturday',
	sundayHoliday = 'sunday_holiday',
	weekday = 'weekday',
}

/* * */

export interface NetworkPeriod {
	id: string
	name: string
	valid_on: string[]
	valid_ranges: DateRange[]
}

/* * */

export interface Plan {
	agency_id: string
	id: string
	valid_range: DateRange
}

/* * */
export interface DateRange {
	end?: string
	start: string
}
