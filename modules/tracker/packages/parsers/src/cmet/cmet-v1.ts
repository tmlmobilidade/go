/* * */

import { clampCoordinate } from '@tmlmobilidade/geo';
import { type RawVehicleEventCmetV1, type SimplifiedVehicleEvent, SimplifiedVehicleEventSchema } from '@tmlmobilidade/types';
import { roundToInt } from '@tmlmobilidade/utils';

/* * */

export const parseRawVehicleEventCmetV1 = (doc: RawVehicleEventCmetV1): null | SimplifiedVehicleEvent => {
	const vehicle = doc.payload.vehicle;
	const validationResult = SimplifiedVehicleEventSchema.safeParse({
		_id: doc._id,
		agency_id: doc.agency_id,
		bearing: roundToInt(vehicle.position.bearing),
		created_at: doc.created_at,
		current_status: vehicle.currentStatus,
		door: vehicle.trigger.door,
		driver_id: vehicle.vehicle.driverId,
		extra_trip_id: vehicle.trip?.extraTripId,
		latitude: clampCoordinate(vehicle.position.latitude),
		longitude: clampCoordinate(vehicle.position.longitude),
		odometer: roundToInt(vehicle.position.odometer),
		pattern_id: vehicle.trip?.patternId,
		received_at: doc.received_at,
		speed: roundToInt(vehicle.position.speed),
		stop_id: vehicle.stopId,
		trip_id: vehicle.trip?.tripId,
		vehicle_id: vehicle.vehicle._id,
	});
	return validationResult.success ? validationResult.data : null;
};
