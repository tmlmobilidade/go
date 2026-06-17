/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, type RawVehicleEventCrtmAisaV1 } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

let ITERATION = 0;

/* * */

const main = async () => {
	//

	const timer = new Timer();

	let saveCount = 0;

	//
	// Fetch the CRTM-AISA Vehicle Events data from the API and decode it

	Logger.info(`[${ITERATION}] Fetching CRTM-AISA data from API...`, 0, 1);

	const decodedMessage = await externalClients.crtmAisa.vehiclePositions();

	Logger.info(`[${ITERATION}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the CRTM-AISA data.`);

	//
	// Transform each message into a RawVehicleEvent

	for (const entity of decodedMessage.entity ?? []) {
		try {
		//

			//
			// Skip entities that do not have a vehicle field,
			// as they are not relevant for our use case.

			if (!entity.vehicle) continue;

			if (!entity.vehicle?.trip?.trip_id) continue;

			//
			// Hash the relevant fields of the vehicle event
			// to create a unique identifier for the event.
			// This allows us to identify duplicate events
			// and avoid storing them multiple times in the database.

			const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventCrtmAisaV1> = {
				agency_id: '1',
				created_at: Dates.fromSeconds(Number(entity.vehicle.timestamp)).unix_timestamp,
				entity_id: entity.id,
				payload: {
					header: decodedMessage.header,
					vehicle: entity.vehicle,
				},
				version: 'crtm-aisa-v1',
			};

			const hashableRawEventId = crypto
				.createHash('sha256')
				.update(JSON.stringify(hashableRawEvent))
				.digest('hex');

			//
			// Write the new vehicle event document
			// to the RawVehicleEvents collection

			const alreadyExists = await rawVehicleEventsNew.findOne({ _id: hashableRawEventId });

			if (alreadyExists) continue;

			await rawVehicleEventsNew.insertOne({
				...hashableRawEvent,
				_id: hashableRawEventId,
				received_at: Dates.now('Europe/Lisbon').unix_timestamp,
			});

			saveCount++;

		//
		} catch (error) {
			Logger.error(`[${ITERATION}] Error processing vehicle event entity with ID ${entity.id}:`, error);
		}
	}

	Logger.info(`[${ITERATION}] Saved ${saveCount} new Vehicle Events from CRTM-AISA data in ${timer.get()}.`);

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '5s', throwOnError: false });
