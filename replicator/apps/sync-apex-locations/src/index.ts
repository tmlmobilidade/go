/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@helperkits/writer';
import { rides, simplifiedApexLocations, uniqueSams } from '@tmlmobilidade/interfaces';
import { parseSimplifiedApexLocation } from '@tmlmobilidade/sae-replicator-pckg-parse';
import { syncDocuments } from '@tmlmobilidade/sae-replicator-pckg-sync';
import { PCGIDB } from '@tmlmobilidade/sae-replicator-pckg-utils';
import { type SimplifiedApexLocation } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import { Interval } from 'luxon';

/* * */

async function syncApexLocations() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Connect to databases and setup DB writers

		await PCGIDB.connect();

		const simplifiedApexLocationsCollection = await simplifiedApexLocations.getCollection();
		const simplifiedApexLocationsDbWritter = new MongoDbWriter<SimplifiedApexLocation>({ batch_size: 100000, collection: simplifiedApexLocationsCollection });

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

		const earliestDataNeeded = Dates
			.fromOperationalDate(process.env.SYNC_EARLIEST_DATE, 'Europe/Lisbon');

		const allTimestampChunks = Interval
			.fromISO(`${earliestDataNeeded.iso}/${thirtySecondsAgo.iso}`)
			.splitBy({ hour: 5 })
			.map(interval => ({ end: interval.end.toMillis(), start: interval.start.toMillis() }))
			.sort((a, b) => b.start - a.start);

		//
		// Iterate over each timestamp chunk and sync the documents.
		// Timestamp chunks are sorted in descending order, so that more recent data is processed first.
		// Timestamp chunks are in the format { start: day1, end: day2 }, so end is always greater than start.
		// This might be confusing as the array of chunks itself is sorted in descending order, but the chunks individually are not.

		for (const [chunkIndex, chunkData] of allTimestampChunks.entries()) {
			//

			const chunkTimer = new TIMETRACKER();

			const chunkStartDate = Dates
				.fromUnixTimestamp(chunkData.start)
				.setZone('Europe/Lisbon', 'offset_only');

			const chunkEndDate = Dates
				.fromUnixTimestamp(chunkData.end)
				.setZone('Europe/Lisbon', 'offset_only');

			LOGGER.spacer(1);
			LOGGER.divider(`[${allTimestampChunks.length - chunkIndex}/${allTimestampChunks.length}] - ${chunkEndDate.iso}[${chunkEndDate.unix_timestamp}] › ${chunkStartDate.iso}[${chunkStartDate.unix_timestamp}]`, 150);

			//
			// Setup the callback function that will be called on the DB Writer flush operation
			// to invalidate all the rides that are affected by the new data.

			const flushCallback = async (flushedData: MongoDBWriterWriteOps<SimplifiedApexLocation>[]) => {
				try {
					//

					const invalidationTimer = new TIMETRACKER();

					//
					// Extract the unique trip_ids from the flushed data and
					// the unique sam serial numbers associated with those transactions.

					const uniqueTripIds: string[] = Array.from(new Set(flushedData.map(writeOp => writeOp.data.trip_id)));
					const uniqueSamSerialNumbers: number[] = Array.from(new Set(flushedData.map(writeOp => writeOp.data.mac_sam_serial_number)));

					//
					// Create a standard window interval based on the earliest and latest timestamps

					const earliestTimestamp = Math.min(...flushedData.map(writeOp => writeOp.data.created_at));
					const latestTimestamp = Math.max(...flushedData.map(writeOp => writeOp.data.created_at));

					const earliestStandardWindowInterval = Dates.fromUnixTimestamp(earliestTimestamp).std_window;
					const latestStandardWindowInterval = Dates.fromUnixTimestamp(latestTimestamp).std_window;

					//
					// Invalidate all rides that are affected

					const updateRidesPromise = rides.updateMany(
						{ start_time_scheduled: { $gte: earliestStandardWindowInterval.start, $lte: latestStandardWindowInterval.end }, trip_id: { $in: uniqueTripIds } },
						{ system_status: 'waiting' },
						{ returnResults: false },
					);

					const updateSamsPromise = uniqueSams.updateMany(
						{ mac_sam_serial_number: { $in: uniqueSamSerialNumbers } },
						{ system_status: 'waiting' },
						{ returnResults: false },
					);

					const [updateRidesResult, updateSamsResult] = await Promise.all([updateRidesPromise, updateSamsPromise]);

					LOGGER.info(`Flush [simplified_apex_locations]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides | ${updateSamsResult.modifiedCount} Unique SAMS (${invalidationTimer.get()})`);

					//
				}
				catch (error) {
					LOGGER.error('Error in flushCallback', error);
				}
			};

			//
			// Prepare the queries to compare documents from each database
			// in the current timestamp chunk.

			const pcgiQuery = {
				'transaction.operatorLongID': { $in: ['41', '42', '43', '44'] },
				'transaction.transactionDate': {
					$gte: chunkStartDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
					$lte: chunkEndDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
				},
			};

			const goQuery = {
				created_at: {
					$gte: chunkStartDate.unix_timestamp,
					$lte: chunkEndDate.unix_timestamp,
				},
			};

			//
			// Sync the documents

			await syncDocuments({

				dbWriter: simplifiedApexLocationsDbWritter,

				docParser: parseSimplifiedApexLocation,

				flushCallback: flushCallback,

				goCollection: simplifiedApexLocationsCollection,

				goIdKey: '_id',

				goQuery: goQuery,

				pcgiCollection: PCGIDB.LocationEntity,

				pcgiIdKey: 'transaction.transactionId',

				pcgiQuery: pcgiQuery,

			});

			//

			LOGGER.success(`Chunk sync complete (${chunkTimer.get()})`);

			//
		}

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}.`);

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
};

/* * */

(async function init() {
	const runOnInterval = async () => {
		await syncApexLocations();
		setTimeout(runOnInterval, 1_800_000);// 30 minutes
	};
	runOnInterval();
})();
