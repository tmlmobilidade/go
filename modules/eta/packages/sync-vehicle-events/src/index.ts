/* * */

import { simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Filter, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Ride, type UnixTimestamp } from '@tmlmobilidade/types';

import { rideProjection } from './types.js';

/* * */

const BATCH_SIZE = 50_000;
const INSERT_CONCURRENCY = 50;

interface SyncVehicleEventsOptions {
	ridesQuery: Filter<Ride>
}

export async function syncVehicleEvents({ ridesQuery }: SyncVehicleEventsOptions) {
	//

	const ridesCollection = await rides.getCollection();
	await simplifiedVehicleEventsNew.delete('\'_id\' != \'\''); // ! DELETE ALL DATA FROM THE TABLE

	//
	// Setup Rides Cursor

	const ridesCount = await ridesCollection.countDocuments(ridesQuery);
	Logger.info(`Syncing vehicle events for ${ridesCount} rides`);

	let ridesProcessed = 0;
	const eventsProcessed = 0;

	//
	// Process rides in batches to avoid cursor timeout

	while (ridesProcessed < ridesCount) {
		const ridesBatch = await ridesCollection
			.find(ridesQuery, { projection: rideProjection })
			.skip(ridesProcessed)
			.limit(BATCH_SIZE)
			.toArray();

		if (ridesBatch.length === 0) break;

		//
		// Process rides in parallel with bounded concurrency

		let rideIndex = 0;
		for (let i = 0; i < ridesBatch.length; i += INSERT_CONCURRENCY) {
			const ridesChunk = ridesBatch.slice(i, i + INSERT_CONCURRENCY);

			await Promise.all(
				ridesChunk.map(async (ride) => {
					if (!ride.start_time_observed || !ride.end_time_observed) return;

					const start = Math.max(ride.start_time_observed, ride.start_time_scheduled) as UnixTimestamp;

					await simplifiedVehicleEventsNew.queryFromString(`
						INSERT INTO eta.vehicle_events
						SELECT _id, '${ride._id}' AS ride_id, '${ride.hashed_shape_id}' AS hashed_shape_id, created_at, latitude, longitude
						FROM operation.simplified_vehicle_events
						WHERE created_at >= ${start} AND created_at <= ${ride.end_time_observed} AND trip_id = '${ride.trip_id}'
					`);

					rideIndex++;
					if (rideIndex % 100 === 0 || rideIndex === ridesBatch.length) {
						Logger.progress(`Processed ${rideIndex}/${ridesBatch.length} rides in this batch`);
					}
				}),
			);
		}

		ridesProcessed += ridesBatch.length;
	}

	return { eventsProcessed, ridesProcessed };
}
