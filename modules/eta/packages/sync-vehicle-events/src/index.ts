/* * */

import { etaVehicleEvents } from '@tmlmobilidade/databases';
import { Filter, rides, simplifiedVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Ride, UnixTimestamp } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/utils';

import { parseToEtaVehicleEvent } from './parser.js';
import { EtaVehicleEvent, rideProjection } from './types.js';

/* * */

const BATCH_SIZE = 50_000;

interface SyncVehicleEventsOptions {
	ridesQuery: Filter<Ride>
}

export async function syncVehicleEvents({ ridesQuery }: SyncVehicleEventsOptions) {
	//

	etaVehicleEvents.clearData();
	const writer = new BatchWriter<EtaVehicleEvent>({
		batch_size: BATCH_SIZE,
		insertFn: async (data) => {
			await etaVehicleEvents.insert('JSONEachRow', data);
		},
		title: 'vehicle_events',
	});

	const ridesCollection = await rides.getCollection();
	const vehicleEventsCollection = await simplifiedVehicleEvents.getCollection();

	//
	// Setup Rides Cursor
	const ridesCount = await ridesCollection.countDocuments(ridesQuery);
	Logger.info(`Syncing vehicle events for ${ridesCount} rides`);

	let ridesProcessed = 0;
	let eventsProcessed = 0;

	// Process rides in batches to avoid cursor timeout
	while (ridesProcessed < ridesCount) {
		const ridesBatch = await ridesCollection
			.find(ridesQuery, { projection: rideProjection })
			.skip(ridesProcessed)
			.limit(BATCH_SIZE)
			.toArray();

		if (ridesBatch.length === 0) break;

		// Process each ride in the batch
		for (const ride of ridesBatch) {
			//

			if (!ride.start_time_observed || !ride.end_time_observed) continue;

			const start = Math.max(ride.start_time_observed, ride.start_time_scheduled) as UnixTimestamp;

			const vehicleEventsCursor = vehicleEventsCollection.find({
				created_at: { $gte: start, $lte: ride.end_time_observed },
				trip_id: ride.trip_id,
			}).batchSize(BATCH_SIZE);

			for await (const vehicleEvent of vehicleEventsCursor) {
				await writer.write(parseToEtaVehicleEvent(vehicleEvent, ride));
				eventsProcessed++;
				if (eventsProcessed % BATCH_SIZE === 0) {
					Logger.progress(`Processed a total of ${eventsProcessed} events from ${ridesProcessed + ridesBatch.indexOf(ride) + 1} rides`);
				}
			}
		}

		ridesProcessed += ridesBatch.length;
		Logger.progress(`Completed batch: ${ridesProcessed}/${ridesCount} rides processed`);
	}

	await writer.flush();

	return { eventsProcessed, ridesProcessed };
}
