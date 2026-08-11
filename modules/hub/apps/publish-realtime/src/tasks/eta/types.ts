/* * */

/** Flat ETA row — matches select-eta.sql */
export interface TripStopEta {
	eta_at: number
	eta_seconds: number
	stop_id: string
	stop_name: string
	stop_sequence: number
	trip_id: string
	vehicle_id: string
}

/** Grouped ETA row — matches select-eta-by-trip.sql / select-eta-by-stop.sql map values */
export interface TripStopEtaCached {
	eta_at: string
	eta_seconds: string
	stop_id: string
	stop_name: string
	stop_sequence: string
	trip_id: string
	vehicle_id: string
}

export interface ClickHouseEtaKeyValue {
	key: string
	value: string
}

export interface ClickHouseEtaGtfsResponse {
	trip_id: string
	trip_update: string
	vehicle_id: string
}

export interface ClickHouseEtaGtfsKeyValue {
	key: string
	value: string
}
