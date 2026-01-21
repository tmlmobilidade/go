/* * */

import { Dates } from '@tmlmobilidade/dates';
import { transformApexValidationForClickHouse } from '@tmlmobilidade/go-replicator-pckg-parse';
import { getEarliestDate, syncToClickHouse } from '@tmlmobilidade/go-replicator-pckg-sync';
import { Filter, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';
import { Interval } from 'luxon';

/* * */

async function syncApexValidationsClickHouse() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Connect to databases and setup ClickHouse writer

		const apexValidationsCollection = await simplifiedApexValidations.getCollection();

		const clickhouseWriter = new ClickHouseWriter<SimplifiedApexValidation>({
			batch_size: 100000,
			clientConfig: {
				database: process.env.CLICKHOUSE_DATABASE,
				password: process.env.CLICKHOUSE_PASSWORD,
				url: `${process.env.CLICKHOUSE_TLS === 'true' ? 'https' : 'http'}://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
				username: process.env.CLICKHOUSE_USERNAME,
			},
			table: 'simplified_apex_validations',
			tableSchema: `
				_id String,
				agency_id String,
				apex_version String,
				card_serial_number String,
				category String,
				created_at Int64,
				device_id String,
				event_type Int32,
				is_passenger UInt8,
				line_id String,
				mac_ase_counter_value Int64,
				mac_sam_serial_number Int64,
				on_board_refund_id Nullable(String),
				on_board_sale_id Nullable(String),
				pattern_id String,
				product_id String,
				received_at Int64,
				stop_id String,
				trip_id String,
				units_qty Nullable(Int32),
				updated_at Int64,
				validation_status Int32,
				vehicle_id Int32,
				operational_date String
			`,
			transformFn: transformApexValidationForClickHouse,
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

			const mongoQuery: Filter<SimplifiedApexValidation> = {
				received_at: {
					$gte: chunkStartDate.unix_timestamp,
					$lte: chunkEndDate.unix_timestamp,
				},
			};

			//
			// Sync from MongoDB to ClickHouse

			await syncToClickHouse<SimplifiedApexValidation>({
				clickhouseWriter: clickhouseWriter,
				mongoCollection: apexValidationsCollection,
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
		await syncApexValidationsClickHouse();
		setTimeout(runOnInterval, 1_800_000); // 30 minutes
	};
	runOnInterval();
})();
