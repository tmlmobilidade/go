/* * */

import { Ride, SimplifiedVehicleEvent } from '@tmlmobilidade/types';

import { EtaVehicleEvent } from './types.js';

/* * */

export function parseToEtaVehicleEvent(simplifiedVehicleEvent: SimplifiedVehicleEvent, ride: Ride): EtaVehicleEvent {
	return {
		_id: simplifiedVehicleEvent._id,
		agency_id: simplifiedVehicleEvent.agency_id,
		created_at: simplifiedVehicleEvent.created_at,
		hashed_shape_id: ride.hashed_shape_id,
		latitude: simplifiedVehicleEvent.latitude,
		line_id: ride.line_id,
		longitude: simplifiedVehicleEvent.longitude,
		ride_id: ride._id,
		vehicle_id: simplifiedVehicleEvent.vehicle_id,
	};
}
