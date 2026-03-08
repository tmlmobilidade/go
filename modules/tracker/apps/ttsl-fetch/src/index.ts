/* * */

import { Dates } from '@tmlmobilidade/dates';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { rawVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

const API_URL = 'https://api.ttsl.pt/files/gtfs_rt_vehicles.pb';

/* * */

let iteration = 0;

const rawVehicleEventsCollection = await rawVehicleEvents.getCollection();

/* * */

const main = async () => {
	//

	const timer = new Timer();

	let saveCount = 0;

	//
	// Fetch the TTSL Vehicle Events data from the API and decode it

	Logger.info(`[${iteration}] Fetching TTSL data from API...`, 0, 1);

	const response = await fetch(API_URL);
	const arrayBuffer = await response.arrayBuffer();
	const decodedMessage = await decodeGtfsRtFeed(arrayBuffer);

	Logger.info(`[${iteration}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the TTSL data.`);

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

		const hashableRawEvent: HashableRawVehicleEvent = {
			agency_id: '4',
			created_at: Dates.fromSeconds(entity.vehicle.timestamp).unix_timestamp,
			entity_id: entity.id,
			raw: entity,
			version: 'default',
		};

		const hashableRawEventId = crypto
			.createHash('sha256')
			.update(JSON.stringify(hashableRawEvent))
			.digest('hex');

		//
		// Write the new vehicle event document
		// to the RawVehicleEvents collection

		const alreadyExists = await rawVehicleEventsCollection.findOne({ _id: hashableRawEventId });

		if (alreadyExists) continue;

		await rawVehicleEventsCollection.insertOne({
			...hashableRawEvent,
			_id: hashableRawEventId,
			received_at: Dates.now('Europe/Lisbon').unix_timestamp,
		});

		saveCount++;

		//
	}

	Logger.info(`[${iteration}] Saved ${saveCount} new Vehicle Events from TTSL data in ${timer.get()}.`);

	iteration++;

	//
};

/* * */

await runOnInterval(main, 1_000);
