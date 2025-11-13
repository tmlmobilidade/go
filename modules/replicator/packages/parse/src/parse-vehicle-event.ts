/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseVehicleEvent(pcgiDoc: any): null | SimplifiedVehicleEvent {
	try {
		return {
			_id: pcgiDoc._id,
			agency_id: pcgiDoc.content.entity[0].vehicle.agencyId,
			created_at: Dates.fromSeconds(pcgiDoc.content.entity[0].vehicle.timestamp).unix_timestamp,
			driver_id: pcgiDoc.content.entity[0].vehicle.vehicle.driverId,
			event_id: pcgiDoc.content.entity[0]._id,
			extra_trip_id: pcgiDoc.content.entity[0].vehicle.trip?.extraTripId,
			latitude: pcgiDoc.content.entity[0].vehicle.position.latitude,
			longitude: pcgiDoc.content.entity[0].vehicle.position.longitude,
			odometer: pcgiDoc.content.entity[0].vehicle.position.odometer,
			pattern_id: pcgiDoc.content.entity[0].vehicle.trip?.patternId,
			received_at: Dates.fromUnixTimestamp(pcgiDoc.millis).unix_timestamp,
			stop_id: pcgiDoc.content.entity[0].vehicle.stopId,
			trigger_activity: pcgiDoc.content.entity[0].vehicle.trigger.activity,
			trigger_door: pcgiDoc.content.entity[0].vehicle.trigger.door,
			trip_id: pcgiDoc.content.entity[0].vehicle.trip?.tripId,
			updated_at: Dates.fromUnixTimestamp(pcgiDoc.millis).unix_timestamp,
			vehicle_id: pcgiDoc.content.entity[0].vehicle.vehicle._id,
		};
	}
	catch (error) {
		console.error(`Error parsing Vehicle Event. Transaction ID: "${pcgiDoc._id}"`, error.message);
		return null;
	}
}
