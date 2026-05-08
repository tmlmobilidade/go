/* * */

export interface SimplifiedVehicleEvent {
	_id?: string
	agency_id: string
	bearing?: number
	created_at?: number
	current_status?: string
	door?: string
	extra_trip_id?: null | string
	latitude?: number
	line_id?: string
	longitude?: number
	odometer?: number
	pattern_id?: string
	received_at?: number
	route_id?: string
	schedule_relationship?: string
	shift_id?: string
	speed?: number
	stop_id?: string
	timestamp?: number
	trip_id?: null | string
	vehicle_id: string
}

export interface VehicleRegistry {
	_id: string
	agency_id: string
	available_seats?: number
	available_standing?: number
	bicycles?: boolean
	bikes_allowed?: boolean
	block_id?: string
	capacity_seated?: number
	capacity_standing?: number
	capacity_total?: number
	climatization?: boolean
	consumption_meter?: boolean
	contactless?: boolean
	corridor?: boolean
	created_at?: number
	created_by?: string
	emission?: string
	emission_class?: string
	external_sound?: boolean
	folding_system?: boolean
	front_display?: boolean
	internal_sound?: boolean
	is_locked?: boolean
	kneeling?: boolean
	license_plate?: string
	lowered_floor?: boolean
	make?: string
	model?: string
	onboard_monitor?: boolean
	owner?: string
	passenger_counting?: boolean
	propulsion?: string
	ramp?: boolean
	rear_display?: boolean
	registration_date?: string
	side_display?: boolean
	start_date?: string
	static_information?: boolean
	typology?: string
	updated_at?: number
	updated_by?: string
	vehicle_id: string
	wheelchair?: boolean
	wheelchair_accessible?: boolean
}

export interface Vehicle extends VehicleRegistry {
	bearing?: number
	current_status?: string
	door?: string
	extra_trip_id?: null | string
	id: string
	lat?: number
	line_id?: string
	lon?: number
	odometer?: number
	pattern_id?: string
	received_at?: number
	route_id?: string
	schedule_relationship?: string
	shift_id?: string
	speed?: number
	stop_id?: string
	timestamp?: number
	trip_id?: null | string
}

export interface VehiclesApiResponse<T> {
	data?: null | T
	error?: null | string
	statusCode?: number
}
