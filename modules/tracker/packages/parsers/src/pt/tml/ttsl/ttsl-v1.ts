/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type RawVehicleEventPtTmlTtslV1, type SimplifiedVehicleEvent, SimplifiedVehicleEventSchema } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export function parseRawVehicleEventPtTmlTtslV1(doc: RawVehicleEventPtTmlTtslV1): null | SimplifiedVehicleEvent {
	const parsedSimplifiedVehicleEvent: SimplifiedVehicleEvent = {
		_id: doc._id,
		agency_id: doc.agency_id,
		bearing: doc.payload.vehicle.position.bearing ?? null,
		created_at: doc.created_at,
		current_status: doc.payload.vehicle.current_status ?? null,
		driver_id: null,
		extra_trip_id: null,
		latitude: doc.payload.vehicle.position.latitude,
		longitude: doc.payload.vehicle.position.longitude,
		odometer: null,
		operational_date: Dates.fromUnixTimestamp(doc.created_at).operational_date_int,
		received_at: doc.received_at,
		speed: doc.payload.vehicle.position.speed ?? null,
		stop_id: doc.payload.vehicle.stop_id ?? null,
		trip_id: doc.payload.vehicle.trip.trip_id,
		vehicle_id: doc.payload.vehicle.vehicle.id,
	};
	return SimplifiedVehicleEventSchema.parse(parsedSimplifiedVehicleEvent);
}
