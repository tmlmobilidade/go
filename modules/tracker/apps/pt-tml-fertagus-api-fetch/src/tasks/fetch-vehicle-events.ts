/* * */

import { externalClients } from '@tmlmobilidade/external';
import { type TrainsResponse } from '@tmlmobilidade/external/dist/clients/fertagus/types.js';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { hashRawVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-shared';
import { type HashableRawVehicleEvent, type RawVehicleEventPtTmlFertagusV1, RawVehicleEventPtTmlFertagusV1PayloadSchema } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';

/* * */

/**
 * Fetches the Fertagus trains from the API and persists each one as-is
 * to the RawVehicleEvents collection. Ride matching and simplification
 * happen downstream in pt-tml-fertagus-rawdb-stream.
 * @param iteration The current run number, used to tag log messages
 * @returns The number of new Vehicle Events saved, or null if the API call failed
 */
export async function fetchVehicleEvents(iteration: number): Promise<null | number> {
	//

	let saveCount = 0;

	//
	// Fetch the Fertagus Vehicle Events data from the API

	Logger.info({ message: `[${iteration}] Fetching Fertagus data from API...`, spacesAfterOrBefore: 1, spacesBefore: 0 });

	let response: null | TrainsResponse;
	try {
		response = await externalClients.fertagus.trains();
	} catch (error) {
		Logger.error({ error, message: `[${iteration}] Error fetching Fertagus data from API:` });
		return null;
	}

	Logger.info({ message: `[${iteration}] Found ${response.length ?? 0} Vehicle Events in the Fertagus data.` });

	//
	// Transform each train into a RawVehicleEvent

	for (const event of response ?? []) {
		try {
			//

			//
			// Skip events that do not match the expected payload shape

			const result = RawVehicleEventPtTmlFertagusV1PayloadSchema.safeParse(event);
			if (!result.success) continue;

			//
			// Hash the relevant fields of the vehicle event
			// to create a unique identifier for the event.

			const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtTmlFertagusV1> = {
				agency_id: '7NTB1',
				created_at: Dates.fromISO(event.date).unix_milliseconds,
				entity_id: `${event.date}-${event.train_id ?? ''}`,
				payload: result.data,
				version: 'pt-tml-fertagus-v1',
			};

			const hashableRawEventId = hashRawVehicleEvent(hashableRawEvent);

			//
			// Write the new vehicle event document
			// to the RawVehicleEvents collection

			const alreadyExists = await rawDb.vehicleEvents.ptTmlFertagus.findOne({ _id: hashableRawEventId });

			if (alreadyExists) continue;

			await rawDb.vehicleEvents.ptTmlFertagus.insertOne({
				...hashableRawEvent,
				_id: hashableRawEventId,
				received_at: Dates.now('Europe/Lisbon').unix_milliseconds,
			});

			saveCount++;

			//
		} catch (error) {
			Logger.error({ error, message: `[${iteration}] Error processing Fertagus event:` });
		}
	}

	return saveCount;

	//
}
