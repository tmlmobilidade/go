/* * */

import { Dates } from '@tmlmobilidade/dates';
import { clampCoordinate } from '@tmlmobilidade/geo';
import { type RawVehicleEventPtTmlMlV1, type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { roundToInt } from '@tmlmobilidade/utils';

/* * */

export const parseRawVehicleEventPtTmlMlV1 = (doc: RawVehicleEventPtTmlMlV1): null | SimplifiedVehicleEvent => {
	const vehicle = doc.payload.vehicle;

	const latitude = clampCoordinate(vehicle.position.latitude);
	const longitude = clampCoordinate(vehicle.position.longitude);
	if (latitude === null || longitude === null) return null;

	return {
		_id: doc._id,
		agency_code: doc.agency_id,
		agency_id: doc.agency_id,
		bearing: vehicle.bearing ? roundToInt(vehicle.bearing) : null,
		created_at: doc.created_at,
		current_status: vehicle.current_status ?? null,
		driver_id: null,
		extra_trip_id: null,
		latitude,
		longitude,
		odometer: null,
		operational_date: Dates.fromUnixTimestamp(doc.created_at).operational_date_int,
		received_at: doc.received_at,
		speed: vehicle.speed ? roundToInt(vehicle.speed) : null,
		stop_id: vehicle.stop_id ?? null,
		trip_id: vehicle.trip.trip_id,
		vehicle_id: vehicle.vehicle.id,
	};
};
