/* * */

import { type RawVehicleEventPtCimatFlaviamobilV1, type SimplifiedVehicleEvent, SimplifiedVehicleEventSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export async function parseRawVehicleEventPtCimatFlaviamobilV1(doc: RawVehicleEventPtCimatFlaviamobilV1): Promise<SimplifiedVehicleEvent> {
	return SimplifiedVehicleEventSchema.parse({
		_id: doc._id,
		agency_id: doc.agency_id,
		created_at: doc.created_at,
		latitude: Number(doc.payload.latitude),
		longitude: Number(doc.payload.longitude),
		operational_date: Dates.fromUnixMilliseconds(doc.created_at).setZone('Europe/Lisbon', 'offset_only').operational_date_int,
		received_at: doc.received_at,
		stop_id: doc.payload.last_stop || null,
		trip_id: doc.payload.trip_id,
		vehicle_id: doc.payload.fleet_number,
	});
}
