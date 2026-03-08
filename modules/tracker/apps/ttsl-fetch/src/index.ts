/* * */

import { Dates } from '@tmlmobilidade/dates';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { rawVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, type RawVehicleEvent } from '@tmlmobilidade/types';
import { MongoDbWriter } from '@tmlmobilidade/writers';
import crypto from 'node:crypto';

/* * */

const API_URL = 'https://api.ttsl.pt/files/gtfs_rt_vehicles.pb';

/* * */

(async function init() {
	//

	let iteration = 0;

	//
	// Initialize the MongoDB writer
	// for the RawVehicleEvents collection

	const rawVehicleEventsDbWritter = new MongoDbWriter<RawVehicleEvent>({
		batch_size: 500,
		batch_timeout: 10000,
		collection: await rawVehicleEvents.getCollection(),
		idle_timeout: 10000,
	});

	//
	// Setup the function to run on a regular interval

	async function runOnInterval() {
		//

		const timer = new Timer();

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
			};

			const hashableRawEventId = crypto
				.createHash('sha256')
				.update(JSON.stringify(hashableRawEvent))
				.digest('hex');

			//
			// Write the new vehicle event document
			// to the RawVehicleEvents collection

			await rawVehicleEventsDbWritter.write(
				{
					...hashableRawEvent,
					_id: hashableRawEventId,
					received_at: Dates.now('Europe/Lisbon').unix_timestamp,
				},
				{
					filter: { _id: hashableRawEventId },
					upsert: true,
				},
			);
		}

		Logger.info(`[${iteration}] Saved ${decodedMessage.entity?.length ?? 0} Vehicle Events from TTSL data in ${timer.get()}.`);

		iteration++;

		setTimeout(runOnInterval, 1_000); // Schedule the next execution after 1 second

		//
	}

	await runOnInterval();

	//
})();
