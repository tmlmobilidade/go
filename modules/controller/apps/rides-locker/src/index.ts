/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates, splitTimeIntervals } from '@tmlmobilidade/go-utils-dates';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const SYNC_DAYS_BACK = 90;

async function main() {
	try {
		//

		//
		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.startNodeLogs({ app: 'rides-locker', message: 'Sentry Rides Locker initialized', module: 'controller', severity: 'info' });
		} catch (error) {
			Logger.error({ error, message: 'Error initializing Sentry Rides Locker' });
		}

		//
		// Initialize the logger

		Logger.init();

		const globalTimer = new Timer();
		//
		// In order to sync both collections in a manageable way, due to the high volume of data,
		// it is necessary to divide the process into smaller blocks. Instead of syncing all documents at once,
		// divide the process by timestamps chunks and iterate over each one, getting all document IDs from both databases.
		// Like this we can more easily compare the IDs in memory and sync only the missing documents.
		// More recent data is more important than older data, so we start syncing the most recent data first.
		// It makes sense to divide chunks by day, but this should be adjusted according to the volume of data in each chunk.

		const thirtySecondsAgo = Dates.now('Europe/Lisbon').minus({ days: SYNC_DAYS_BACK - 2 });
		const earliestDataNeeded = Dates.now('Europe/Lisbon').minus({ days: SYNC_DAYS_BACK });

		const allTimestampChunks = splitTimeIntervals(earliestDataNeeded.unix_timestamp, thirtySecondsAgo.unix_timestamp, 2);

		//
		// Iterate over each timestamp chunk and sync the documents.
		// Timestamp chunks are sorted in descending order, so that more recent data is processed first.
		// Timestamp chunks are in the format { start: day1, end: day2 }, so end is always greater than start.
		// This might be confusing as the array of chunks itself is sorted in descending order, but the chunks individually are not.

		const totalRides = 0;
		for (const [chunkIndex, chunkData] of allTimestampChunks.entries()) {
			//

			const chunkTimer = new Timer();
			const progress = `[${chunkIndex + 1}/${allTimestampChunks.length}]`;

			const chunkStartDate = Dates
				.fromUnixTimestamp(chunkData.start)
				.setZone('Europe/Lisbon', 'offset_only');

			const chunkEndDate = Dates
				.fromUnixTimestamp(chunkData.end)
				.setZone('Europe/Lisbon', 'offset_only');

			Logger.spacer(1);
			Logger.title(`${progress} - ${chunkEndDate.toFormat('yyyy-MM-dd HH:mm:ss')} › ${chunkStartDate.toFormat('yyyy-MM-dd HH:mm:ss')}`);

			//
			// Fetch the ride acceptances.
			const foundRides = await goDb.operation.rideAcceptances.findMany({ created_at: { $gte: chunkStartDate.unix_timestamp, $lte: chunkEndDate.unix_timestamp } });

			//
			// Loop through the found rides and process
			let totalRides = 0;
			for (const rideAcceptance of foundRides) {
				//

				totalRides++;

				if (rideAcceptance.is_locked) continue;

				await goDb.operation.rideAcceptances.updateById(rideAcceptance._id, { is_locked: true, updated_by: 'system' });
				Logger.info({ message: `Locked ride acceptance for ride ${rideAcceptance.ride_id}.` });
			}

			//

			Logger.info({ message: `Found ${totalRides} ride acceptances. (${chunkTimer.get()})` });

			Logger.spacer(1);
			Logger.divider();
		}

		Logger.info({ message: `Total rides: ${totalRides}. (${globalTimer.get()})` });
	} catch (err) {
		Logger.error({ error: err, message: 'An error occurred. Halting execution.' });
		Logger.info({ message: 'Retrying in 10 seconds...' });
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}

	//
}

//

await runOnInterval(main, { intervalMs: '10m' });
