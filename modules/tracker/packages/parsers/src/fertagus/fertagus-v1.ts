/* * */

import { Dates } from '@tmlmobilidade/dates';
import { clampCoordinate } from '@tmlmobilidade/geo';
import { type RawVehicleEventFertagusV1, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

export const parseRawVehicleEventFertagusV1 = (doc: RawVehicleEventFertagusV1): null | SimplifiedVehicleEvent => {
	const vehicle = doc.payload.vehicle;
	// Validate coordinates before parsing the rest of the event.
	const latitude = clampCoordinate(vehicle.position.latitude);
	const longitude = clampCoordinate(vehicle.position.longitude);
	if (latitude === null || longitude === null) return null;
	return {
		_id: doc._id,
		agency_id: doc.agency_id,
		bearing: null,
		created_at: doc.created_at,
		current_status: vehicle.current_status ?? null,
		door: null,
		driver_id: null,
		extra_trip_id: null,
		latitude: latitude,
		longitude: longitude,
		odometer: null,
		operational_date: Dates.fromUnixTimestamp(doc.created_at).operational_date,
		pattern_id: vehicle.trip.pattern_id,
		received_at: doc.received_at,
		speed: null,
		stop_id: null,
		trip_id: vehicle.trip.trip_id,
		vehicle_id: vehicle.vehicle.id,
	};
};
