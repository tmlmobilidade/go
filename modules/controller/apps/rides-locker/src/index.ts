/* * */

import { Dates } from '@tmlmobilidade/dates';
import { rideAcceptances } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';
import { Interval } from 'luxon';

/* * */

const SYNC_DAYS_BACK = 90;

async function main() {
	try {
		//

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

		const allTimestampChunks = Interval
			.fromISO(`${earliestDataNeeded.iso}/${thirtySecondsAgo.iso}`)
			.splitBy({ hour: 2 })
			.map(interval => ({ end: interval.end.toMillis(), start: interval.start.toMillis() }))
			.sort((a, b) => b.start - a.start);

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
			Logger.title(`${progress} - ${chunkEndDate.toLocaleString(Dates.FORMATS.DATETIME_MEDIUM_WITH_SECONDS)} › ${chunkStartDate.toLocaleString(Dates.FORMATS.DATETIME_MEDIUM_WITH_SECONDS)}`);

			//
			// Fetch the ride acceptances.
			const foundRides = await rideAcceptances.findMany({ created_at: { $gte: chunkStartDate.unix_timestamp, $lte: chunkEndDate.unix_timestamp } });

			//
			// Loop through the found rides and process
			let totalRides = 0;
			for (const rideAcceptance of foundRides) {
				//

				totalRides++;

				if (rideAcceptance.is_locked) continue;

				await rideAcceptances.updateByRideId(rideAcceptance.ride_id, { is_locked: true, updated_by: 'system' });
				Logger.info(`Locked ride acceptance for ride ${rideAcceptance.ride_id}.`);
			}

			//

			Logger.info(`Found ${totalRides} ride acceptances. (${chunkTimer.get()})`);

			Logger.spacer(1);
			Logger.divider();
		}

		Logger.info(`Total rides: ${totalRides}. (${globalTimer.get()})`);
	} catch (err) {
		Logger.error('An error occurred. Halting execution.', err);
		Logger.info('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}

	//
}

//

await runOnInterval(main, { intervalMs: '10m' });
