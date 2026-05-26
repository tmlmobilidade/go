/* * */

export enum Facility {
	AIRPORT = 'airport',
	BIKE_PARKING = 'bike_parking',
	BIKE_SHARING = 'bike_sharing',
	BOAT = 'boat',
	CAR_PARKING = 'car_parking',
	LIGHT_RAIL = 'light_rail',
	NEAR_FIRE_STATION = 'near_fire_station',
	NEAR_HEALTH_CLINIC = 'near_health_clinic',
	NEAR_HISTORIC_BUILDING = 'near_historic_building',
	NEAR_HOSPITAL = 'near_hospital',
	NEAR_POLICE_STATION = 'near_police_station',
	NEAR_SCHOOL = 'school',
	NEAR_SHOPPING = 'shopping',
	NEAR_TRANSIT_OFFICE = 'transit_office',
	NEAR_UNIVERSITY = 'near_university',
	SUBWAY = 'subway',
	TRAIN = 'train',
}

/* * */

export type OperationalStatus = 'active' | 'inactive' | 'provisional' | 'seasonal' | 'voided';

/* * */

export interface LegacyStop {
	district_id: string
	district_name: string
	facilities: string[]
	id: string
	lat: number
	line_ids: string[]
	locality_id?: string
	locality_name?: string
	lon: number
	long_name: string
	municipality_id: string
	municipality_name: string
	operational_status: OperationalStatus
	parish_id: string
	parish_name: string
	pattern_ids: string[]
	route_ids: string[]
	short_name: null | string
	tts_name: string
	wheelchair_boarding: boolean
}

/* * */

export type StopLifecycleStatus = 'active' | 'draft' | 'inactive' | 'provisional' | 'seasonal' | 'voided';

export interface StopRegistryFlag {
	agency_ids?: string[]
	is_harmonized?: boolean
	short_name: string
	stop_id: string
}

export interface StopRegistry {
	_id: number
	bench_status?: 'damaged' | 'missing' | 'not_applicable' | 'ok' | 'unknown'
	comments?: unknown[]
	connections?: string[]
	created_at?: number
	created_by?: null | string
	district_id?: string
	electricity_status?: 'available' | 'unavailable' | 'unknown'
	equipment?: string[]
	facilities?: string[]
	file_ids?: string[]
	flags?: StopRegistryFlag[]
	has_bench?: 'available' | 'unavailable' | 'unknown'
	has_mupi?: 'available' | 'unavailable' | 'unknown'
	has_network_map?: 'available' | 'unavailable' | 'unknown'
	has_schedules?: 'available' | 'unavailable' | 'unknown'
	has_shelter?: 'available' | 'unavailable' | 'unknown'
	has_stop_sign?: 'available' | 'unavailable' | 'unknown'
	image_ids?: string[]
	is_deleted?: boolean
	is_locked?: boolean
	jurisdiction?: 'ip' | 'municipality' | 'other' | 'unknown'
	last_infrastructure_check?: null | number
	last_infrastructure_maintenance?: null | number
	last_schedules_check?: null | number
	last_schedules_maintenance?: null | number
	latitude: number
	legacy_id?: null | string
	legacy_ids?: string[]
	lifecycle_status?: StopLifecycleStatus
	locality_id?: null | string
	longitude: number
	municipality_id?: string
	name: string
	new_name?: null | string
	observations?: null | string
	parish_id?: null | string
	pole_status?: 'damaged' | 'missing' | 'not_applicable' | 'ok' | 'unknown'
	previous_go_id?: null | string
	road_type?: string
	shelter_code?: null | string
	shelter_frame_size?: [number, number] | null
	shelter_installation_date?: null | number
	shelter_maintainer?: null | string
	shelter_make?: null | string
	shelter_model?: null | string
	shelter_status?: 'damaged' | 'missing' | 'not_applicable' | 'ok' | 'unknown'
	short_name: string
	tts_name: string
	updated_at?: number
	updated_by?: string
}

export interface Stop extends StopRegistry {
	district_name: string
	facilities: string[]
	id: string
	lat: number
	line_ids: string[]
	locality_name?: string
	lon: number
	long_name: string
	municipality_name: string
	operational_status: OperationalStatus
	parish_name: string
	pattern_ids: string[]
	route_ids: string[]
	wheelchair_boarding: boolean
}

/* * */

export interface StopsApiResponse<T> {
	data?: null | T
	error?: null | string
	statusCode?: number
}

/* * */

export interface Arrival {
	estimated_arrival: null | string
	estimated_arrival_unix: null | number
	headsign: string
	line_id: string
	observed_arrival: null | string
	observed_arrival_unix: null | number
	pattern_id: string
	related_trip_ids?: string[]
	route_id: string
	scheduled_arrival: string
	scheduled_arrival_unix: number
	stop_sequence: number
	trip_id: string
	vehicle_id: null | string
};

export type ArrivalStatus = 'canceled' | 'passed' | 'realtime' | 'scheduled';
