/* * */

import { createClient } from '@clickhouse/client';
import { Dates } from '@tmlmobilidade/dates';
import { parseSimplifiedApexOnBoardSale } from '@tmlmobilidade/go-apex-pckg-parse';
import { getEarliestDate } from '@tmlmobilidade/go-apex-pckg-sync';
import { pcgidbTicketing, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import { ClickHouseWriter } from '@tmlmobilidade/writers';
import { Interval } from 'luxon';

/* * */

const CLICKHOUSE_TABLE = 'simplified_apex_on_board_sales';
const CLICKHOUSE_DELETE_BATCH_SIZE = 5_000;

/* * */

function getClickHouseConfig() {
	return {
		database: process.env.CLICKHOUSE_DATABASE,
		password: process.env.CLICKHOUSE_PASSWORD,
		url: `${process.env.CLICKHOUSE_TLS === 'true' ? 'https' : 'http'}://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
		username: process.env.CLICKHOUSE_USERNAME,
	};
}

function escapeClickHouseString(value: string) {
	return value.replace(/\\/g, '\\\\').replace(/'/g, `\\'`);
}

async function deleteExtraDocumentsFromClickHouse(extraDocumentIds: string[], chunkStart: number, chunkEnd: number) {
	if (extraDocumentIds.length === 0) return;

	const client = createClient(getClickHouseConfig());

	try {
		for (let index = 0; index < extraDocumentIds.length; index += CLICKHOUSE_DELETE_BATCH_SIZE) {
			const deleteBatch = extraDocumentIds.slice(index, index + CLICKHOUSE_DELETE_BATCH_SIZE);
			const inClause = deleteBatch.map(item => `'${escapeClickHouseString(item)}'`).join(', ');

			await client.command({
				query: `
					ALTER TABLE ${CLICKHOUSE_TABLE}
					DELETE WHERE created_at >= ${chunkStart}
					AND created_at <= ${chunkEnd}
					AND _id IN (${inClause})
					SETTINGS mutations_sync = 1
				`,
			});
		}
	}
	finally {
		await client.close();
	}
}

/* * */

async function syncApexOnBoardSales() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Connect to databases and setup ClickHouse writer

		await pcgidbTicketing.connect();

		const clickhouseWriter = new ClickHouseWriter<SimplifiedApexOnBoardSale>({
			batch_size: 100_000,
			clientConfig: getClickHouseConfig(),
			table: CLICKHOUSE_TABLE,
			tableSchema: [
				{ name: '_id', primaryKey: true, type: 'String' },
				{ name: 'agency_id', type: 'String' },
				{ name: 'apex_version', type: 'String' },
				{ name: 'block_id', type: 'Nullable(String)' },
				{ name: 'card_physical_type', type: 'Int64' },
				{ name: 'card_serial_number', type: 'String' },
				{ name: 'created_at', type: 'Int64' },
				{ name: 'device_id', type: 'String' },
				{ name: 'duty_id', type: 'Nullable(String)' },
				{ name: 'is_passenger', type: 'Bool' },
				{ name: 'line_id', type: 'Nullable(String)' },
				{ name: 'mac_ase_counter_value', type: 'Int64' },
				{ name: 'mac_sam_serial_number', type: 'Int64' },
				{ name: 'on_board_refund_id', type: 'Nullable(String)' },
				{ name: 'pattern_id', type: 'Nullable(String)' },
				{ name: 'payment_method', type: 'Int64' },
				{ name: 'price', type: 'Float64' },
				{ name: 'product_long_id', type: 'String' },
				{ name: 'product_quantity', type: 'Int64' },
				{ name: 'received_at', type: 'Int64' },
				{ name: 'stop_id', type: 'Nullable(String)' },
				{ name: 'trip_id', type: 'Nullable(String)' },
				{ name: 'updated_at', type: 'Int64' },
				{ name: 'validation_id', type: 'Nullable(String)' },
				{ name: 'vehicle_id', type: 'Nullable(Int64)' },
			],
			transformFn: data => ({
				...data,
				_id: String(data._id),
			}),
		});

		await clickhouseWriter.ensureTable(undefined, 'MergeTree', 'created_at');

		//
		// In order to sync both collections in a manageable way, due to the high volume of data,
		// it is necessary to divide the process into smaller blocks. Instead of syncing all documents at once,
		// divide the process by timestamps chunks and iterate over each one, getting all document IDs from both databases.
		// Like this we can more easily compare the IDs in memory and sync only the missing documents.
		// More recent data is more important than older data, so we start syncing the most recent data first.
		// It makes sense to divide chunks by day, but this should be adjusted according to the volume of data in each chunk.

		const thirtySecondsAgo = Dates
			.now('Europe/Lisbon')
			.minus({ seconds: 30 });

		const earliestDataNeeded = getEarliestDate();

		const allTimestampChunks = Interval
			.fromISO(`${earliestDataNeeded.iso}/${thirtySecondsAgo.iso}`)
			.splitBy({ hours: 10 })
			.map(interval => ({ end: interval.end.toMillis(), start: interval.start.toMillis() }))
			.sort((a, b) => b.start - a.start);

		//
		// Iterate over each timestamp chunk and sync the documents.
		// Timestamp chunks are sorted in descending order, so that more recent data is processed first.
		// Timestamp chunks are in the format { start: day1, end: day2 }, so end is always greater than start.
		// This might be confusing as the array of chunks itself is sorted in descending order, but the chunks individually are not.

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
			// Setup the callback function that will be called on the DB Writer flush operation
			// to invalidate all the rides that are affected by the new data.

			const flushCallback = async (flushedData?: SimplifiedApexOnBoardSale[]) => {
				if (!flushedData || flushedData.length === 0) return;

				try {
					//

					const invalidationTimer = new Timer();

					//
					// Extract the unique trip_ids from the flushed data and
					// the unique sam serial numbers associated with those transactions.

					const uniqueTripIds = Array.from(new Set(flushedData.map(item => item.trip_id).filter(Boolean))) as string[];
					if (uniqueTripIds.length === 0) return;

					//
					// Create a standard window interval based on the earliest and latest timestamps

					const earliestTimestamp = Math.min(...flushedData.map(item => item.created_at));
					const latestTimestamp = Math.max(...flushedData.map(item => item.created_at));

					const earliestStandardWindowInterval = Dates.fromUnixTimestamp(earliestTimestamp).std_window;
					const latestStandardWindowInterval = Dates.fromUnixTimestamp(latestTimestamp).std_window;

					//
					// Invalidate all rides that are affected

					const updateRidesResult = await rides.updateMany(
						{ start_time_scheduled: { $gte: earliestStandardWindowInterval.start, $lte: latestStandardWindowInterval.end }, trip_id: { $in: uniqueTripIds } },
						{ system_status: 'waiting' },
						{ returnResults: false },
					);

					Logger.info(`Flush [apex_on_board_sales]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

					//
				}
				catch (error) {
					Logger.error('Error in flushCallback', error);
				}
			};

			//
			// Prepare the queries to compare documents from each database
			// in the current timestamp chunk.

			const pcgiQuery = {
				'transaction.apexTransactionType': 3,
				'transaction.cardPhysicalType': 28,
				'transaction.operatorLongID': { $in: ['41', '42', '43', '44'] },
				'transaction.transactionDate': {
					$gte: chunkStartDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
					$lte: chunkEndDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
				},
			};

			const clickhouseQuery = {
				created_at: {
					$gte: chunkStartDate.unix_timestamp,
					$lte: chunkEndDate.unix_timestamp,
				},
			};

			const countQueryTimer = new Timer();

			const pcgiDocCount = await pcgidbTicketing.SalesEntity.countDocuments(pcgiQuery);
			const clickhouseDocCount = await clickhouseWriter.countDocuments(clickhouseQuery);

			if (pcgiDocCount === clickhouseDocCount) {
				Logger.success(`MATCH: Found the same number of documents in both databases: ${pcgiDocCount} PCGIDB = ${clickhouseDocCount} ClickHouse (${countQueryTimer.get()})`);
				Logger.success(`Chunk sync complete (${chunkTimer.get()})`);
				continue;
			}

			Logger.info(`MISMATCH: Document count was different for both databases: ${pcgiDocCount} PCGIDB != ${clickhouseDocCount} ClickHouse (${countQueryTimer.get()})`);

			const distinctQueryTimer = new Timer();

			const pcgiDocIds = await pcgidbTicketing.SalesEntity.distinct('transaction.transactionId', pcgiQuery);
			const clickhouseDocIds = await clickhouseWriter.distinct<string>('_id', clickhouseQuery);

			const pcgiDocIdsUnique = new Set(pcgiDocIds.map(String));
			const clickhouseDocIdsUnique = new Set(clickhouseDocIds.map(String));

			const missingDocuments = pcgiDocIds.filter((documentId: string) => !clickhouseDocIdsUnique.has(String(documentId)));
			const extraDocuments = clickhouseDocIds.filter((documentId: string) => !pcgiDocIdsUnique.has(String(documentId)));

			Logger.info(`PCGI Total: ${pcgiDocCount} | PCGI Unique: ${pcgiDocIdsUnique.size} | PCGI ▲: ${pcgiDocCount - pcgiDocIdsUnique.size} | CH Total: ${clickhouseDocCount} | CH Unique: ${clickhouseDocIdsUnique.size} | CH ▲: ${clickhouseDocCount - clickhouseDocIdsUnique.size} | CH Missing: ${missingDocuments.length} | CH Extra: ${extraDocuments.length} (${distinctQueryTimer.get()})`);

			if (extraDocuments.length > 0) {
				await deleteExtraDocumentsFromClickHouse(extraDocuments, chunkStartDate.unix_timestamp, chunkEndDate.unix_timestamp);
				Logger.info(`Removed ${extraDocuments.length} extra documents in ClickHouse. (${distinctQueryTimer.get()})`);
			}

			if (missingDocuments.length === 0) {
				Logger.success(`Chunk complete. All document IDs matched. (${distinctQueryTimer.get()})`);
				Logger.success(`Chunk sync complete (${chunkTimer.get()})`);
				continue;
			}

			Logger.info(`Found ${missingDocuments.length} missing documents in ClickHouse. (${distinctQueryTimer.get()})`);

			const missingDocumentsStream = pcgidbTicketing.SalesEntity
				.find({ 'transaction.transactionId': { $in: missingDocuments } })
				.stream();

			let syncedCount = 0;

			for await (const pcgiDocument of missingDocumentsStream) {
				const parsedOnBoardSale = parseSimplifiedApexOnBoardSale(pcgiDocument);
				if (!parsedOnBoardSale) continue;

				await clickhouseWriter.write(parsedOnBoardSale, undefined, flushCallback);
				syncedCount++;
			}

			await clickhouseWriter.flush(flushCallback);

			Logger.success(`Complete! Synced ${syncedCount} new documents. (${chunkTimer.get()})`);

			//

			Logger.success(`Chunk sync complete (${chunkTimer.get()})`);

			//
		}

		//

		await clickhouseWriter.close();

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

runOnInterval(syncApexOnBoardSales, 1_800_000); // 30 minutes
