/* * */

import { type RawVehicleEventCmetV1, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

export const parseRawVehicleEventCmetV1 = (doc: RawVehicleEventCmetV1): SimplifiedVehicleEvent => {
	const vehicle = doc.payload.vehicle;
	return {
		_id: doc._id,
		agency_id: doc.agency_id,
		bearing: vehicle.position.bearing,
		created_at: doc.created_at,
		current_status: vehicle.currentStatus,
		door: vehicle.trigger.door,
		driver_id: vehicle.vehicle.driverId,
		extra_trip_id: vehicle.trip?.extraTripId,
		latitude: vehicle.position.latitude,
		longitude: vehicle.position.longitude,
		odometer: vehicle.position.odometer,
		pattern_id: vehicle.trip?.patternId,
		received_at: doc.received_at,
		speed: vehicle.position.speed,
		stop_id: vehicle.stopId,
		trip_id: vehicle.trip?.tripId,
		vehicle_id: vehicle.vehicle._id,
	};
};
