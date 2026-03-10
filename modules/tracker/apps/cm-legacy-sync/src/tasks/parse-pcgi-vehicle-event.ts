/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type HashableTrackerVehicleEvent, type TrackerCmetV1, type TrackerVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-common';
import { type PcgiVehicleEvent } from '@tmlmobilidade/types';
import crypto from 'node:crypto';

/* * */

export function parsePcgiVehicleEvent(pcgiVehicleEvent: PcgiVehicleEvent): TrackerVehicleEvent[] {
	//

	const result: TrackerVehicleEvent[] = [];

	//
	// Transform each message into a RawVehicleEvent

	for (const entity of pcgiVehicleEvent.content.entity ?? []) {
		//

		//
		// Skip entities that do not have a vehicle field,
		// as they are not relevant for our use case.

		if (!entity.vehicle) continue;

		//
		// Hash the relevant fields of the vehicle event
		// to create a unique identifier for the event.
		// This allows us to identify duplicate events
		// and avoid storing them multiple times in the database.

		const hashableRawEvent: HashableTrackerVehicleEvent<TrackerCmetV1> = {
			agency_id: entity.vehicle.agencyId,
			created_at: Dates.fromSeconds(entity.vehicle.timestamp).unix_timestamp,
			entity_id: entity._id,
			raw: {
				header: pcgiVehicleEvent.content.header,
				vehicle: entity.vehicle,
			},
			version: 'cmet-v1',
		};

		const hashableRawEventId = crypto
			.createHash('sha256')
			.update(JSON.stringify(hashableRawEvent))
			.digest('hex');

		//
		// Write the new vehicle event document
		// to the RawVehicleEvents collection

		result.push({
			...hashableRawEvent,
			_id: hashableRawEventId,
			received_at: Dates.fromUnixTimestamp(pcgiVehicleEvent.millis).unix_timestamp,
		});

		//
	}

	return result;

	//
};
