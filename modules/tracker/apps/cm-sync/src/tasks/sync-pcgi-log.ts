/* * */

import { parsePcgiVehicleEvent } from '@/tasks/parse-pcgi-vehicle-event.js';
import { getEarliestDate } from '@/utils/earliest-date.js';
import { Dates } from '@tmlmobilidade/dates';
import { pcgidbLegacy, rawVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type RawVehicleEvent } from '@tmlmobilidade/types';
import { MongoDbWriter } from '@tmlmobilidade/writers';
import { Interval } from 'luxon';

/* * */

export async function syncPcgiLog() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Connect to databases and setup DB writers

		await pcgidbLegacy.connect();

		const rawVehicleEventsCollection = await rawVehicleEvents.getCollection();
		const rawVehicleEventsDbWritter = new MongoDbWriter<RawVehicleEvent>({ batch_size: 100_000, collection: rawVehicleEventsCollection });

		//
		// In order to sync both collections in a manageable way, due to the high volume of data,
		// it is necessary to divide the process into smaller blocks. Instead of syncing all documents at once,
		// divide the process by timestamp chunks and iterate over each one, getting all document IDs from both databases.
		// Like this we can more easily compare the IDs in memory and sync only the missing documents.
		// More recent data is more important, so we start syncing it first.

		const thirtySecondsAgo = Dates
			.now('Europe/Lisbon')
			.minus({ seconds: 30 });

		const earliestDataNeeded = getEarliestDate();

		const allTimestampChunks = Interval
			.fromISO(`${earliestDataNeeded.iso}/${thirtySecondsAgo.iso}`)
			.splitBy({ minute: 30 })
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
			// Prepare the queries to compare documents from each database
			// in the current timestamp chunk.

			const srcQuery = {
				millis: {
					$gte: chunkStartDate.unix_timestamp,
					$lte: chunkEndDate.unix_timestamp,
				},
			};

			//
			// Sync all documents in the current timestamp chunk. We query the SRC database for all documents
			// in the current timestamp chunk, parse them and write them to the DEST database. This is done in batches,
			// so that we don't overload the memory.

			const srcStream = pcgidbLegacy.VehicleEventsLog.find(srcQuery).stream();

			for await (const document of srcStream) {
				const parsedDocuments = parsePcgiVehicleEvent(document);
				for (const parsedDocument of parsedDocuments) {
					await rawVehicleEventsDbWritter.write(parsedDocument, {
						filter: { _id: parsedDocument._id },
						upsert: true,
					});
				}
			}

			Logger.success(`Chunk sync complete (${chunkTimer.get()})`);

			//
		}

		await rawVehicleEventsDbWritter.flush();

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => process.exit(0), 10_000);
	}
};
