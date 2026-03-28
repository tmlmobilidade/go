/* * */

import { clampCoordinate } from '@tmlmobilidade/geo';
import { type RawVehicleEventCmetV1Core, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { roundToInt } from '@tmlmobilidade/utils';

/* * */

export function parseRawVehicleEventCmetV1Core(doc: RawVehicleEventCmetV1Core): null | SimplifiedVehicleEvent {
	const vehicle = doc.payload.vehicle;
	// Validate coordinates before parsing the rest of the event.
	const latitude = clampCoordinate(vehicle.position.latitude);
	const longitude = clampCoordinate(vehicle.position.longitude);
	if (latitude === null || longitude === null) return null;
	return {
		_id: doc._id,
		agency_id: doc.agency_id,
		bearing: roundToInt(vehicle.position.bearing),
		created_at: doc.created_at,
		current_status: vehicle.currentStatus,
		door: vehicle.trigger.door,
		driver_id: vehicle.vehicle.driverId,
		extra_trip_id: vehicle.trip?.extraTripId,
		latitude: latitude,
		longitude: longitude,
		odometer: roundToInt(vehicle.position.odometer),
		pattern_id: vehicle.trip?.patternId,
		received_at: doc.received_at,
		speed: roundToInt(vehicle.position.speed),
		stop_id: vehicle.stopId,
		trip_id: vehicle.trip?.tripId,
		vehicle_id: vehicle.vehicle._id,
	};
};
