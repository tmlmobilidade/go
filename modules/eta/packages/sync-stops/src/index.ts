/* * */
import { ClickHouseClient } from '@tmlmobilidade/clickhouse';
import { Filter, hashedTrips, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { HashedTrip, Ride } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

import { StopNode, stopTableSchema } from './types.js';

/* * */

interface SyncStopsOptions {
	batchSize: number
	client: ClickHouseClient
	ridesQuery: Filter<Ride>
}

export async function syncStops({ batchSize = 100_000, client, ridesQuery }: SyncStopsOptions): Promise<{ stopsProcessed: number }> {
	//

	const writer = new ClickHouseWriter<StopNode>({
		batch_size: batchSize,
		client,
		table: 'stops',
		tableSchema: stopTableSchema,
	});
	await client.command({ query: 'DROP TABLE IF EXISTS stops' });
	await writer.ensureTable();

	Logger.info(`Getting distinct hashed shape ids from rides`);
	const distinctHashedTripIds = await rides.distinct('hashed_trip_id', ridesQuery);
	const hashedTripsCollection = await hashedTrips.getCollection();

	const hashedTripsCursor = hashedTripsCollection.find<HashedTrip>(
		{ _id: { $in: distinctHashedTripIds } },
		{ projection: { _id: 0, path: { stop_id: 1, stop_lat: 1, stop_lon: 1 } } },
	).batchSize(batchSize).stream();

	Logger.info(`Creating stops for ${distinctHashedTripIds.length} hashed trip ids`);

	const stopsMap = new Map<string, StopNode>();
	for await (const hashedTrip of hashedTripsCursor) {
		for (const stop of hashedTrip.path) {
			stopsMap.set(stop.stop_id, {
				id: stop.stop_id,
				latitude: stop.stop_lat,
				longitude: stop.stop_lon,
			});
		}
	}

	let stopsProcessed = 0;
	for (const stop of stopsMap.values()) {
		stopsProcessed++;
		await writer.write(stop);
	}

	await writer.flush();

	return { stopsProcessed };
}
