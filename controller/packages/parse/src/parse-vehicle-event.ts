/* * */

import { type VehicleEvent } from '@tmlmobilidade/core/types';
import { validateUnixTimestamp } from '@tmlmobilidade/core/utils';
import { DateTime } from 'luxon';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseVehicleEvent(pcgiDoc: any): VehicleEvent {
	//

	return {
		_id: pcgiDoc._id,
		agency_id: pcgiDoc.content.entity[0].vehicle.agencyId,
		created_at: validateUnixTimestamp(DateTime.fromSeconds(pcgiDoc.content.entity[0].vehicle.timestamp).toMillis()),
		driver_id: pcgiDoc.content.entity[0].vehicle.vehicle.driverId,
		event_id: pcgiDoc.content.entity[0]._id,
		extra_trip_id: pcgiDoc.content.entity[0].vehicle.trip?.extraTripId,
		latitude: pcgiDoc.content.entity[0].vehicle.position.latitude,
		longitude: pcgiDoc.content.entity[0].vehicle.position.longitude,
		odometer: pcgiDoc.content.entity[0].vehicle.position.odometer,
		pattern_id: pcgiDoc.content.entity[0].vehicle.trip?.patternId,
		received_at: validateUnixTimestamp(DateTime.fromMillis(pcgiDoc.millis).toMillis()),
		stop_id: pcgiDoc.content.entity[0].vehicle.stopId,
		trigger_activity: pcgiDoc.content.entity[0].vehicle.trigger.activity,
		trigger_door: pcgiDoc.content.entity[0].vehicle.trigger.door,
		trip_id: pcgiDoc.content.entity[0].vehicle.trip?.tripId,
		updated_at: validateUnixTimestamp(DateTime.fromMillis(pcgiDoc.millis).toMillis()),
		vehicle_id: pcgiDoc.content.entity[0].vehicle.vehicle._id,
	};

	//
}
