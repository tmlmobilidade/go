/* * */

import { externalClients } from '@tmlmobilidade/external';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { hashRawVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-shared';
import { type HashableRawVehicleEvent, type RawVehicleEventPtTmlCpV1 } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';

/* * */

/**
 * Fetches the CP Vehicle Events from the API and writes
 * the ones not yet stored to the RawVehicleEvents collection.
 * @param iteration The current run number, used to tag log messages
 * @returns The number of new Vehicle Events saved
 */
export async function fetchVehicleEvents(iteration: number): Promise<number> {
	//

	let saveCount = 0;

	//
	// Fetch the CP Vehicle Events data from the API and decode it

	Logger.info({ message: `[${iteration}] Fetching CP data from API...`, spacesAfterOrBefore: 1, spacesBefore: 0 });

	const decodedMessage = await externalClients.cp.vehiclePositions();

	Logger.info({ message: `[${iteration}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the CP data.` });

	//
	// Transform each message into a RawVehicleEvent

	for (const entity of decodedMessage.entity ?? []) {
		//

		//
		// Skip entities that do not have a vehicle field,
		// as they are not relevant for our use case.

		if (!entity.vehicle) continue;

		//
		// Skip entities that do not have a trip field,
		// as they are not relevant for our use case.

		if (!entity.vehicle.trip) continue;

		//
		// Skip entities that do not have a position field,
		// as they are not relevant for our use case.

		if (!entity.vehicle.position) continue;

		//
		// Hash the relevant fields of the vehicle event
		// to create a unique identifier for the event.
		// This allows us to identify duplicate events
		// and avoid storing them multiple times in the database.

		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtTmlCpV1> = {
			agency_id: 'N18KL',
			created_at: Dates.fromSeconds(Number(entity.vehicle.timestamp)).unix_milliseconds,
			entity_id: entity.id,
			payload: {
				header: decodedMessage.header,
				vehicle: {
					...entity.vehicle,
					vehicle: {
						id: entity.id,
					},
				},
			},
			version: 'pt-tml-cp-v1',
		};

		const hashableRawEventId = hashRawVehicleEvent(hashableRawEvent);

		//
		// Write the new vehicle event document
		// to the RawVehicleEvents collection

		const alreadyExists = await rawDb.vehicleEvents.ptTmlCp.findOne({ _id: hashableRawEventId });

		if (alreadyExists) continue;

		await rawDb.vehicleEvents.ptTmlCp.insertOne({
			...hashableRawEvent,
			_id: hashableRawEventId,
			received_at: Dates.now('Europe/Lisbon').unix_milliseconds,
		});

		saveCount++;

		//
	}

	return saveCount;

	//
}
