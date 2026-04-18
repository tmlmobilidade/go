/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, type RawVehicleEventCcflV1 } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

const API_URL = 'https://gateway.carris.pt/gateway/gtfs/api/v2.8/GTFS/realtime/vehiclepositions';

/* * */

let ITERATION = 0;

/* * */

const main = async () => {
	//

	const timer = new Timer();

	let saveCount = 0;

	//
	// Fetch the CCFL Vehicle Events data from the API and decode it

	Logger.info(`[${ITERATION}] Fetching CCFL data from API...`, 0, 1);

	const response = await fetch(API_URL);
	const arrayBuffer = await response.arrayBuffer();
	const decodedMessage = await decodeGtfsRtFeed(arrayBuffer);

	Logger.info(`[${ITERATION}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the CCFL data.`);

	//
	// Transform each message into a RawVehicleEvent

	for (const entity of decodedMessage.entity ?? []) {
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

		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventCcflV1> = {
			agency_id: '1',
			created_at: Dates.fromSeconds(Number(entity.vehicle.timestamp)).unix_timestamp,
			entity_id: entity.id,
			payload: {
				header: decodedMessage.header,
				vehicle: entity.vehicle,
			},
			version: 'ccfl-v1',
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
	}

	Logger.info(`[${ITERATION}] Saved ${saveCount} new Vehicle Events from CCFL data in ${timer.get()}.`);

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: 1_000 });
