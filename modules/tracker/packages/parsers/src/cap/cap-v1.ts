/* * */

import { clampCoordinate } from '@tmlmobilidade/geo';
import { type RawVehicleEventCapV1, type SimplifiedVehicleEvent, SimplifiedVehicleEventSchema } from '@tmlmobilidade/types';
import { roundToInt } from '@tmlmobilidade/utils';

/* * */

export const parseRawVehicleEventCapV1 = (doc: RawVehicleEventCapV1): null | SimplifiedVehicleEvent => {
	const vehicle = doc.payload.vehicle;
	const validationResult = SimplifiedVehicleEventSchema.safeParse({
		_id: doc._id,
		agency_id: doc.agency_id,
		bearing: roundToInt(vehicle.position.bearing),
		created_at: doc.created_at,
		current_status: vehicle.current_status ?? null,
		door: null,
		driver_id: null,
		extra_trip_id: null,
		latitude: clampCoordinate(vehicle.position.latitude),
		longitude: clampCoordinate(vehicle.position.longitude),
		pattern_id: null,
		received_at: doc.received_at,
		speed: roundToInt(vehicle.position.speed),
		stop_id: vehicle.stop_id ?? null,
		trip_id: vehicle.trip.trip_id,
		vehicle_id: vehicle.vehicle.id,
	});
	return validationResult.success ? validationResult.data : null;
};
