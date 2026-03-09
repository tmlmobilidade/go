/* * */

import { Dates } from '@tmlmobilidade/dates';
import { transformVehicleEventForClickHouse } from '@tmlmobilidade/go-replicator-pckg-parse';
import { getEarliestDate, syncToClickHouse } from '@tmlmobilidade/go-replicator-pckg-sync';
import { pcgidbLegacy } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { ClickHouseVehicleEvent } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import { ClickHouseWriter } from '@tmlmobilidade/writers';
import { Interval } from 'luxon';

/* * */

async function syncVehicleEventsClickHouse() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Connect to databases and setup ClickHouse writer

		await pcgidbLegacy.connect();

		const clickhouseWriter = new ClickHouseWriter<ClickHouseVehicleEvent>({
			batch_size: 100_000,
			clientConfig: {
				database: process.env.CLICKHOUSE_DATABASE,
				password: process.env.CLICKHOUSE_PASSWORD,
				url: `${process.env.CLICKHOUSE_TLS === 'true' ? 'https' : 'http'}://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
				username: process.env.CLICKHOUSE_USERNAME,
			},
			table: 'vehicle_events',
			tableSchema: [
				// Entity
				{ name: '_id', primaryKey: true, type: 'String' },
				{ name: 'event_id', type: 'String' },
				{ name: 'agency_id', type: 'String' },
				{ name: 'driver_id', type: 'String' },
				{ name: 'stop_id', type: 'String' },
				{ name: 'plan_id', type: 'String' },
				{ name: 'pattern_id', type: 'String' },
				{ name: 'route_id', type: 'String' },
				{ name: 'trip_id', type: 'String' },
				{ name: 'extra_trip_id', nullable: true, type: 'String' },
				{ name: 'vehicle_id', type: 'String' },
				{ name: 'current_status', type: 'String' },
				{ name: 'trigger_activity', type: 'String' },
				{ name: 'trigger_door', type: 'String' },
				// Time
				{ name: 'created_at', type: 'Int64' },
				{ name: 'updated_at', type: 'Int64' },
				{ name: 'received_at', type: 'Int64' },
				{ name: 'operational_date', type: 'String' },
				{ name: 'hour', type: 'UInt8' },
				// Position
				{ name: 'odometer', type: 'Float64' },
				{ name: 'latitude', type: 'Float64' },
				{ name: 'longitude', type: 'Float64' },
				{ name: 'geohash_2', type: 'String' },
				{ name: 'geohash_3', type: 'String' },
				{ name: 'geohash_4', type: 'String' },
				{ name: 'geohash_5', type: 'String' },
				{ name: 'geohash_6', type: 'String' },
				{ name: 'geohash_7', type: 'String' },
				{ name: 'geohash_8', type: 'String' },
				{ name: 'geohash_9', type: 'String' },
				{ name: 'geohash_10', type: 'String' },
				{ name: 'geohash_11', type: 'String' },
				{ name: 'geohash_12', type: 'String' },
				{ name: 'h3_1', type: 'String' },
				{ name: 'h3_2', type: 'String' },
				{ name: 'h3_3', type: 'String' },
				{ name: 'h3_4', type: 'String' },
				{ name: 'h3_5', type: 'String' },
				{ name: 'h3_6', type: 'String' },
				{ name: 'h3_7', type: 'String' },
				{ name: 'h3_8', type: 'String' },
				{ name: 'h3_9', type: 'String' },
				{ name: 'h3_10', type: 'String' },
				{ name: 'h3_11', type: 'String' },
				{ name: 'h3_12', type: 'String' },
			],
			transformFn: transformVehicleEventForClickHouse,
		});

		//
		// Ensure the ClickHouse table exists before starting the sync

		await clickhouseWriter.ensureTable(undefined, 'MergeTree', 'received_at');

		//
		// In order to sync in a manageable way, due to the high volume of data,
		// it is necessary to divide the process into smaller blocks.
		// Divide the process by timestamps chunks and iterate over each one.
		// More recent data is more important than older data, so we start syncing the most recent data first.

		const thirtySecondsAgo = Dates
			.now('Europe/Lisbon')
			.minus({ seconds: 30 });

		const earliestDataNeeded = getEarliestDate();

		const allTimestampChunks = Interval
			.fromISO(`${earliestDataNeeded.iso}/${thirtySecondsAgo.iso}`)
			.splitBy({ hours: 4 })
			.map(interval => ({ end: interval.end.toMillis(), start: interval.start.toMillis() }))
			.sort((a, b) => b.start - a.start);

		//
		// Iterate over each timestamp chunk and sync the documents from PCGI to ClickHouse.
		// Timestamp chunks are sorted in descending order, so that more recent data is processed first.

		for (const [chunkIndex, chunkData] of allTimestampChunks.entries()) {
			//

			const chunkTimer = new Timer();

			const chunkStartDate = Dates
				.fromUnixTimestamp(chunkData.start)
				.setZone('Europe/Lisbon', 'offset_only');

			const chunkEndDate = Dates
				.fromUnixTimestamp(chunkData.end)
				.setZone('Europe/Lisbon', 'offset_only');

			Logger.spacer(1);
			Logger.divider(`[${allTimestampChunks.length - chunkIndex}/${allTimestampChunks.length}] - ${chunkEndDate.iso}[${chunkEndDate.unix_timestamp}] › ${chunkStartDate.iso}[${chunkStartDate.unix_timestamp}]`, 150);

			//
			// Query to filter documents in PCGI for this chunk

			const pcgiQuery = {
				millis: {
					$gte: chunkStartDate.unix_timestamp,
					$lte: chunkEndDate.unix_timestamp,
				},
			};

			const clickhouseQuery = {
				received_at: {
					$gte: chunkStartDate.unix_timestamp,
					$lte: chunkEndDate.unix_timestamp,
				},
			};

			//
			// Sync from PCGI to ClickHouse

			await syncToClickHouse<ClickHouseVehicleEvent>({
				clickhouseQuery: clickhouseQuery,
				clickhouseWriter: clickhouseWriter,
				mongoCollection: pcgidbLegacy.VehicleEvents,
				mongoQuery: pcgiQuery,
			});

			//

			Logger.success(`Chunk sync complete (${chunkTimer.get()})`);

			//
		}

		//

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
}

/* * */

runOnInterval(syncVehicleEventsClickHouse, 1_800_000); // 30 minutes
