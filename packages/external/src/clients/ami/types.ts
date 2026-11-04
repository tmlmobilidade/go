/* * */

/** A row from AMI WS_TRACK's semicolon-delimited vehicle positions feed. */
export interface AmiVehiclePosition {
	departure_date: string
	destination: string
	direction: string
	fleet_number: string
	last_stop: string
	latitude: string
	line_code: string
	longitude: string
	origin: string
	position_date: string
	trip_id: string
}
