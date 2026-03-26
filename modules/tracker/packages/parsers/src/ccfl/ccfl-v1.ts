/* * */

import { type RawVehicleEventCcflV1, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

export const parseRawVehicleEventCcflV1 = (doc: RawVehicleEventCcflV1): SimplifiedVehicleEvent => {
	const vehicle = doc.payload.vehicle;
	return {
		_id: doc._id,
		agency_id: doc.agency_id,
		bearing: vehicle.position.bearing ?? null,
		created_at: doc.created_at,
		current_status: vehicle.current_status ?? null,
		door: null,
		driver_id: null,
		extra_trip_id: null,
		latitude: vehicle.position.latitude,
		longitude: vehicle.position.longitude,
		odometer: null,
		pattern_id: null,
		received_at: doc.received_at,
		speed: vehicle.position.speed ?? null,
		stop_id: vehicle.stop_id ?? null,
		trip_id: vehicle.trip.trip_id,
		vehicle_id: vehicle.vehicle.id,
	};
};
