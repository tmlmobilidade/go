/* * */

import { etaVehicleEvents, simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Filter, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Ride, type UnixTimestamp } from '@tmlmobilidade/types';

import { rideProjection } from './types.js';

/* * */

const BATCH_SIZE = 50_000;

interface SyncVehicleEventsOptions {
	ridesQuery: Filter<Ride>
}

export async function syncVehicleEvents({ ridesQuery }: SyncVehicleEventsOptions) {
	//

	const ridesCollection = await rides.getCollection();
	const clickhouseClient = await simplifiedVehicleEventsNew.getClient();
	await etaVehicleEvents.clearData(); // ! DELETE ALL DATA FROM THE TABLE

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

		const ridesInput = ridesBatch.reduce<Array<{
			end_time: number
			hashed_shape_id: string
			line_id: number
			ride_id: string
			start_time: number
			trip_id: string
		}>>((acc, ride) => {
			if (!ride.start_time_observed || !ride.end_time_observed || !ride.trip_id || !ride.hashed_shape_id || !Number.isFinite(ride.line_id)) return acc;
			const start = Math.max(ride.start_time_observed, ride.start_time_scheduled) as UnixTimestamp;
			acc.push({
				end_time: ride.end_time_observed,
				hashed_shape_id: ride.hashed_shape_id,
				line_id: ride.line_id,
				ride_id: ride._id,
				start_time: start,
				trip_id: ride.trip_id,
			});
			return acc;
		}, []);

		if (ridesInput.length > 0) {
			const stagingTable = `tmp_vehicle_events_rides_${Date.now()}_${ridesProcessed}`;

			try {
				await clickhouseClient.command({
					query: `
						CREATE TABLE eta.${stagingTable} (
							ride_id String,
							hashed_shape_id String,
							line_id Int64,
							trip_id String,
							start_time Int64,
							end_time Int64
						) ENGINE = Memory
					`,
				});

				await clickhouseClient.insert({
					format: 'JSONEachRow',
					table: `eta.${stagingTable}`,
					values: ridesInput,
				});

				await simplifiedVehicleEventsNew.queryFromString(`
					INSERT INTO eta.vehicle_events
					SELECT
						sve._id,
						sve.created_at,
						sve.agency_id,
						tmp.ride_id,
						tmp.hashed_shape_id,
						tmp.line_id,
						sve.latitude,
						sve.longitude,
						sve.vehicle_id
					FROM operation.simplified_vehicle_events AS sve
					INNER JOIN eta.${stagingTable} AS tmp
						ON sve.trip_id = tmp.trip_id
						AND sve.created_at >= tmp.start_time
						AND sve.created_at <= tmp.end_time
				`);
			} finally {
				await clickhouseClient.command({
					query: `DROP TABLE IF EXISTS eta.${stagingTable}`,
				});
			}
		}

		ridesProcessed += ridesBatch.length;
		Logger.progress(`Processed ${ridesProcessed}/${ridesCount} rides`);
	}

	return { eventsProcessed, ridesProcessed };
}
