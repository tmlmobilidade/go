/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/* * */

const SYNC_DAYS_BACK = 90;

async function main() {
	try {
		//

		//
		// Initialize the logger

		Logger.init();

		const globalTimer = new Timer();

		const totalRides = 0;
		performInTimeChunks({
			endDate: Dates.now('Europe/Lisbon').minus({ days: SYNC_DAYS_BACK - 2 }).unix_milliseconds,
			intervalHrs: 1,
			onChunk: async (chunk) => {
				//

				const chunkTimer = new Timer();
				const progress = `[${chunk.index + 1}/${chunk.total}]`;

				Logger.spacer(1);
				Logger.title(`${progress} - ${Dates.fromUnixMilliseconds(chunk.start).toLocaleString('full')} › ${Dates.fromUnixMilliseconds(chunk.end).toLocaleString('full')}`);

				//
				// Fetch the ride acceptances.

				const foundRides = await goDb.operation.rideAcceptances.findMany({ created_at: { $gte: chunk.start, $lte: chunk.end } });
				const rideAcceptances = await goDb.operation.rideAcceptances.getCollection();

				//
				// Loop through the found rides and process

				let totalRides = 0;

				for (const rideAcceptance of foundRides) {
					totalRides++;
					if (rideAcceptance.is_locked) continue;
					const now = Dates.now('utc').unix_milliseconds;
					const result = await rideAcceptances.updateOne(
						{ _id: rideAcceptance._id, is_locked: { $ne: true } },
						{
							$push: { comments: {
								created_at: now,
								created_by: 'system',
								curr_value: true,
								field: 'is_locked',
								prev_value: false,
								type: 'field_changed',
								updated_at: now,
								updated_by: 'system',
							} },
							$set: { is_locked: true, updated_at: now, updated_by: 'system' },
						},
					);
					if (!result.modifiedCount) continue;
					Logger.info({ message: `Locked ride acceptance for ride ${rideAcceptance._id}.` });
				}

				Logger.info({ message: `Found ${totalRides} ride acceptances. (${chunkTimer.get()})` });

				Logger.spacer(1);
				Logger.divider();
			},
			order: 'desc',
			startDate: Dates.now('Europe/Lisbon').minus({ days: SYNC_DAYS_BACK }).unix_milliseconds,
		});

		Logger.info({ message: `Total rides: ${totalRides}. (${globalTimer.get()})` });
	} catch (err) {
		Logger.critical({ error: err, message: 'An error occurred. Halting execution.' });
		Logger.info({ message: 'Retrying in 10 seconds...' });
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}

	//
}

//

await runOnInterval(main, { intervalMs: '10m' });
