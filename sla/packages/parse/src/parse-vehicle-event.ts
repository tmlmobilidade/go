/* * */

import { type UnixTimestamp, type VehicleEvent } from '@tmlmobilidade/core/types';
import { DateTime } from 'luxon';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseVehicleEvent(pcgiDoc: any): VehicleEvent {
	//

	const vehicleTimestamp = DateTime.fromSeconds(pcgiDoc.content.entity[0].vehicle.timestamp);

	console.log('millis vs int', pcgiDoc.millis, DateTime.fromMillis(pcgiDoc.millis).toUnixInteger());

	return {
		_id: pcgiDoc._id,
		agency_id: pcgiDoc.content.entity[0].vehicle.agencyId,
		created_at: vehicleTimestamp.toUnixInteger() as UnixTimestamp,
		driver_id: pcgiDoc.content.entity[0].vehicle.vehicle.driverId,
		event_id: pcgiDoc.content.entity[0]._id,
		extra_trip_id: pcgiDoc.content.entity[0].vehicle.trip?.extraTripId,
		latitude: pcgiDoc.content.entity[0].vehicle.position.latitude,
		longitude: pcgiDoc.content.entity[0].vehicle.position.longitude,
		odometer: pcgiDoc.content.entity[0].vehicle.position.odometer,
		pattern_id: pcgiDoc.content.entity[0].vehicle.trip?.patternId,
		received_at: DateTime.fromMillis(pcgiDoc.millis).toUnixInteger() as UnixTimestamp,
		stop_id: pcgiDoc.content.entity[0].vehicle.stopId,
		trigger_activity: pcgiDoc.content.entity[0].vehicle.trigger.activity,
		trigger_door: pcgiDoc.content.entity[0].vehicle.trigger.door,
		trip_id: pcgiDoc.content.entity[0].vehicle.trip?.tripId,
		updated_at: DateTime.fromMillis(pcgiDoc.millis).toUnixInteger() as UnixTimestamp,
		vehicle_id: pcgiDoc.content.entity[0].vehicle.vehicle._id,
	};

	//
}
