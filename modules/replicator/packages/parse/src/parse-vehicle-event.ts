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
			bearing: pcgiDoc.content.entity[0].vehicle.position.bearing,
			created_at: Dates.fromSeconds(pcgiDoc.content.entity[0].vehicle.timestamp).unix_timestamp,
			current_status: pcgiDoc.content.entity[0].vehicle.currentStatus,
			door: pcgiDoc.content.entity[0].vehicle.trigger.door,
			driver_id: pcgiDoc.content.entity[0].vehicle.vehicle.driverId,
			extra_trip_id: pcgiDoc.content.entity[0].vehicle.trip?.extraTripId,
			latitude: pcgiDoc.content.entity[0].vehicle.position.latitude,
			longitude: pcgiDoc.content.entity[0].vehicle.position.longitude,
			odometer: pcgiDoc.content.entity[0].vehicle.position.odometer,
			operational_date: Dates.fromSeconds(pcgiDoc.content.entity[0].vehicle.timestamp).operational_date,
			pattern_id: pcgiDoc.content.entity[0].vehicle.trip?.patternId,
			received_at: Dates.fromUnixTimestamp(pcgiDoc.millis).unix_timestamp,
			speed: pcgiDoc.content.entity[0].vehicle.position.speed,
			stop_id: pcgiDoc.content.entity[0].vehicle.stopId,
			trip_id: pcgiDoc.content.entity[0].vehicle.trip?.tripId,
			vehicle_id: pcgiDoc.content.entity[0].vehicle.vehicle._id,
		};
	} catch (error) {
		console.error(`Error parsing Vehicle Event. Transaction ID: "${pcgiDoc._id}"`, error.message);
		return null;
	}
}
