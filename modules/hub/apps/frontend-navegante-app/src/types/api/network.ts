/* * */

import type { Feature, LineString } from 'geojson';

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

export interface HubRoute {
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

export interface HubPattern {
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
	path: HubWaypoint[]
	region_ids: string[]
	route_id: string
	shape_id: string
	short_name: string
	text_color: string
	trips: HubTrip[]
	tts_headsign: string
	valid_on: string[]
	version_id: string
}

export interface HubWaypoint {
	allow_drop_off: boolean
	allow_pickup: boolean
	distance: number
	distance_delta: number
	stop_id: string
	stop_sequence: number
}

export interface HubTrip {
	schedule: HubArrival[]
	service_ids: string[]
	trip_ids: string[]
	valid_on: string[]
	version_id: string
}

export interface HubArrival {
	arrival_time: string
	arrival_time_24h: string
	stop_id: string
	stop_sequence: number
}

/* * */

export interface HubShape {
	extension: number
	geojson: Feature<LineString>
	points: HubShapePoint[]
	shape_id: string
}

export interface HubShapePoint {
	shape_dist_traveled: number
	shape_pt_lat: number
	shape_pt_lon: number
	shape_pt_sequence: number
}

/* * */

export interface HubDate {
	day_type: DateDayType
	description: string
	holiday: boolean
	id: string
	period_id: string
}

export enum DateDayType {
	Saturday = 'saturday',
	SundayHoliday = 'sunday_holiday',
	Weekday = 'weekday',
}

/* * */

export interface HubPeriod {
	id: string
	name: string
	valid_on: string[]
	valid_ranges: HubDateRange[]
}

/* * */

export interface HubPlan {
	agency_id: string
	id: string
	valid_range: HubDateRange
}

/* * */
export interface HubDateRange {
	end?: string
	start: string
}
