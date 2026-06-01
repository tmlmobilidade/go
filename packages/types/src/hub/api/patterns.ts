/* * */

export interface HubPattern {
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
