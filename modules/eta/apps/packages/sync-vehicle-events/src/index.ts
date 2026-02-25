/* * */

import { ClickHouseClient } from '@tmlmobilidade/clickhouse';
import { Dates } from '@tmlmobilidade/dates';
import { Filter, rides, simplifiedVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Ride, UnixTimestamp } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

import { parseToEtaVehicleEvent } from './parser.js';
import { EtaVehicleEvent, etaVehicleEventTableSchema, rideProjection } from './types.js';

/* * */

interface SyncVehicleEventsOptions {
	batchSize: number
	client: ClickHouseClient
	endDate: UnixTimestamp
	startDate: UnixTimestamp
}

export async function syncVehicleEvents({ batchSize = 100_000, client, endDate, startDate }: SyncVehicleEventsOptions) {
	//

	const writer = new ClickHouseWriter<EtaVehicleEvent>({
		batch_size: batchSize,
		client,
		table: 'vehicle_events',
		tableSchema: etaVehicleEventTableSchema,
	});
	await writer.ensureTable();

	const ridesCollection = await rides.getCollection();
	const vehicleEventsCollection = await simplifiedVehicleEvents.getCollection();

	//
	// Setup Rides Cursor
	const ridesQuery: Filter<Ride> = {
		end_time_scheduled: { $gte: startDate, $lt: endDate },
		start_time_scheduled: { $gte: startDate, $lt: endDate },
	};

	const ridesCount = await ridesCollection.countDocuments(ridesQuery);
	Logger.info(`Syncing vehicle events for ${ridesCount} rides (${Dates.fromUnixTimestamp(startDate).toFormat('yyyy-MM-dd')} → ${Dates.fromUnixTimestamp(endDate).toFormat('yyyy-MM-dd')})`);

	let ridesProcessed = 0;
	let eventsProcessed = 0;

	// Process rides in batches to avoid cursor timeout
	while (ridesProcessed < ridesCount) {
		const ridesBatch = await ridesCollection
			.find(ridesQuery, { projection: rideProjection })
			.skip(ridesProcessed)
			.limit(batchSize)
			.toArray();

		if (ridesBatch.length === 0) break;

		// Process each ride in the batch
		for (const ride of ridesBatch) {
			//

			if (!ride.start_time_observed || !ride.end_time_observed) continue;

			const vehicleEventsCursor = vehicleEventsCollection.find({
				created_at: { $gte: ride.start_time_observed, $lte: ride.end_time_observed },
				trip_id: ride.trip_id,
			}).batchSize(batchSize);

			for await (const vehicleEvent of vehicleEventsCursor) {
				await writer.write(parseToEtaVehicleEvent(vehicleEvent, ride));
				eventsProcessed++;
				if (eventsProcessed % batchSize === 0) {
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
