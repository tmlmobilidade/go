/* * */

import { Dates } from '@tmlmobilidade/dates';
import { transformVehicleEventForClickHouse } from '@tmlmobilidade/go-replicator-pckg-parse';
import { getEarliestDate, syncToClickHouse } from '@tmlmobilidade/go-replicator-pckg-sync';
import { Filter, simplifiedVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
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

		const vehicleEventsCollection = await simplifiedVehicleEvents.getCollection();

		const clickhouseWriter = new ClickHouseWriter<SimplifiedVehicleEvent>({
			batch_size: 100000,
			clientConfig: {
				database: process.env.CLICKHOUSE_DATABASE,
				password: process.env.CLICKHOUSE_PASSWORD,
				url: `${process.env.CLICKHOUSE_TLS === 'true' ? 'https' : 'http'}://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
				username: process.env.CLICKHOUSE_USERNAME,
			},
			table: 'simplified_vehicle_events',
			tableSchema: `
				_id String,
				agency_id String,
				created_at Int64,
				current_status String,
				driver_id String,
				event_id String,
				extra_trip_id Nullable(String),
				latitude Float64,
				longitude Float64,
				odometer Float64,
				pattern_id String,
				position_geohash String,
				position_h3 String,
				position_latitude Float64,
				position_longitude Float64,
				received_at Int64,
				stop_id String,
				trigger_activity String,
				trigger_door String,
				trip_id String,
				updated_at Int64,
				vehicle_id String
			`,
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
		// Iterate over each timestamp chunk and sync the documents from MongoDB to ClickHouse.
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
			// Query to filter documents in MongoDB for this chunk

			const mongoQuery: Filter<SimplifiedVehicleEvent> = {
				received_at: {
					$gte: chunkStartDate.unix_timestamp,
					$lte: chunkEndDate.unix_timestamp,
				},
			};

			//
			// Sync from MongoDB to ClickHouse

			await syncToClickHouse<SimplifiedVehicleEvent>({
				clickhouseWriter: clickhouseWriter,
				mongoCollection: vehicleEventsCollection,
				mongoQuery: mongoQuery,
			});

			//

			Logger.success(`Chunk sync complete (${chunkTimer.get()})`);

			//
		}

		//

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	}
	catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
}

/* * */

(async function init() {
	const runOnInterval = async () => {
		await syncVehicleEventsClickHouse();
		setTimeout(runOnInterval, 1_800_000); // 30 minutes
	};
	runOnInterval();
})();
