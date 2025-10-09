/* eslint-disable perfectionist/sort-interfaces */

export interface DrtPatternPoints {
	operator_id: number
	operation_plan_id: string
	pattern_id: string
	ordinal: number
	stop_code: string
	stop_name: string
	lat: number
	lng: number
	is_stop: boolean
	is_waypoint: boolean
	meters_from_start: number
	meters_to_end: number
	meters_from_previous_stop: number
	meters_to_next_stop: number
}

export interface DrtPatternStops {
	operator_id: number
	operation_plan_id: string
	pattern_id: string
	ordinal: number
	stop_sequence: number
	stop_headsign: string
	fare_info: string
	stop_code: string
	stop_name: string
	lat: number
	lng: number
	meters_from_start: number
	meters_to_end: number
	meters_from_previous_stop: number
	meters_to_next_stop: number

}

export interface DrtPatterns {
	operator_id: number
	operation_plan_id: string
	pattern_id: string
	metric: number
	start_stop_code: string
	end_stop_code: string
	serial_id: number
	encoded_path: string
}

export interface DrtRoutes {
	operator_id: number
	operation_plan_id: string
	line_id: string
	line_short_name: string
	line_long_name: string
	route_id: string
	route_origin: string
	route_destination: string
	route_short_name: string
	route_long_name: string
	route_url: string
	route_color: string
	route_text_color: string
	route_sort_order: number
	route_desc: string
	pattern_id: string
	variant_name: string
	variant_description: string
	direction_id: number
	school: number
	continuous_pickup: number
	continuous_drop_off: number
	sample_trip_id: string
}

export interface DrtStops {
	operator_id: number
	operation_plan_id: string
	stop_id: string
	stop_code: string
	stop_name: string
	stop_desc: string
	stop_lat: number
	stop_lng: number
	zone_shift: string
	stop_url: string
	location_type: number
	parent_station: string
	stop_timezone: string
	wheelchair_boarding: string
	platform_code: string
	entrance_restriction: string
	exit_restriction: string
	slot: string
	signalling: string
	shelter: string
	bench: string
	network_map: string
	schedule: string
	real_time_information: string
	tariff: string
	preservation_state: string
	equipment: string
	observations: string
	region: string
	municipality: string
	municipality_fare_1: string
	municipality_fare_2: string

}

export interface DrtJourneys {
	operator_id: number
	operation_plan_id: string
	date: string
	journey_id: number
	day_type_id: number
	holiday: number
	period: number
	block_id: string
	start_shift_id: string
	end_shift_id: string
	trip_headsign: string
	trip_id: string
	trip_short_name: string
	start_stop_id: string
	start_stop_sequence: number
	start_departure_time: string
	end_stop_id: string
	end_stop_sequence: number
	end_arrival_time: string
	va_trip_number: number
	da_trip_number: number
	route_id: string
	route_long_name: string
	route_origin: string
	route_destination: string
	route_short_name: string
	route_desc: string
	line_id: string
	line_short_name: string
	line_long_name: string
	direction_id: number
	pattern_id: string
	pattern_short_name: string
	shape_id: string
	journey_metric: number
	run_type: string
}
