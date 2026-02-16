/* * */

import { Dates } from '@tmlmobilidade/dates';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { rawVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { type RawVehicleEvent } from '@tmlmobilidade/types';
import { MongoDbWriter } from '@tmlmobilidade/writers';
import crypto from 'node:crypto';

/* * */

const API_URL = 'https://api.ttsl.pt/files/gtfs_rt_vehicles.pb';

/* * */

(async function init() {
	//

	//
	// Initialize the MongoDB writer
	// for the RawVehicleEvents collection

	const vehicleEventsDbWritter = new MongoDbWriter<SimplifiedVehicleEvent>({
		batch_size: 500,
		batch_timeout: 10000,
		collection: await rawVehicleEvents.getCollection(),
		idle_timeout: 10000,
	});

	//
	// Setup the function to run on a regular interval

	async function runOnInterval() {
		//

		Logger.info('Fetching TTSL data from API...');

		const response = await fetch(API_URL);
		const arrayBuffer = await response.arrayBuffer();

		Logger.info('Decoding TTSL data...');

		const decodedMessage = await decodeGtfsRtFeed(arrayBuffer);

		Logger.info(`Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the TTSL data.`);

		//
		// Transform each message into a RawVehicleEvent

		for (const entity of decodedMessage.entity ?? []) {
			//

			if (!entity.) {

			const rawEvent: Omit<RawVehicleEvent, '_id' | 'received_at'> = {
				agency_id: '4',
				created_at: Dates.fromSeconds(entity.vehicle.timestamp.low).unix_timestamp,
				current_status: entity.vehicle.current_status,
				door: null,
				driver_id: null,
				extra_trip_id: null,
				latitude: entity.vehicle.position.latitude,
				longitude: entity.vehicle.position.longitude,
				odometer: null,
				pattern_id: null,
				stop_id: entity.vehicle.stop_id,
				trip_id: entity.vehicle.trip.trip_id,
				vehicle_id: entity.vehicle.vehicle.id,
			};
			// Hash the contents of the raw event to create a unique event ID
			const hashableSimplifiedEvent = JSON.stringify(rawEvent);
			const uniqueIdValueForSimplifiedEvent = crypto
				.createHash('sha256')
				.update(hashableSimplifiedEvent)
				.digest('hex');
			//
			// Write the new vehicle event document to the VehicleEvents collection

			await vehicleEventsDbWritter.write(newVehicleEventDocument, { filter: { _id: newVehicleEventDocument._id }, upsert: true }, () => null, flushCallback);
		}

		Logger.info(`Fetched ${decodedMessage.entity?.length ?? 0} vehicle events from TTSL data.`);
		// console.log(JSON.stringify(decodedMessage['entity'], null, 2));
	}

	await runOnInterval();

	setInterval(runOnInterval, 1_000); // Fetch data every 10 seconds

	//
})();
