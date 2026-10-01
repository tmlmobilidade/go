/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { syncRides } from './tasks/sync-rides.js';

/* * */

async function main() {
	//

	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Get the earliest date from which we have data to sync,
		// and perform the sync in time chunks until we reach the current date.

		const earliestRide = await goDb.operation.rides.findOne({}, {
			projection: { _id: 1, start_time_scheduled: 1 },
			sort: { start_time_scheduled: 1 },
		});

		const latestRide = await goDb.operation.rides.findOne({}, {
			projection: { _id: 1, start_time_scheduled: 1 },
			sort: { start_time_scheduled: -1 },
		});

		if (!earliestRide || !latestRide) {
			throw new Error('No rides found');
		}

		Logger.title(`Running sync from ${Dates.fromUnixMilliseconds(earliestRide.start_time_scheduled).toLocaleString('full', 'UTC')} to ${Dates.fromUnixMilliseconds(latestRide.start_time_scheduled).toLocaleString('full', 'UTC')}`);

		//
		// Divide the time range into chunks
		// and sync each one sequentially.

		await performInTimeChunks({
			endDate: latestRide.start_time_scheduled,
			intervalHrs: 12,
			onChunk: async (chunk) => {
				try {
					// For rides syncing, we need to avoid adding and deleting rides
					// for the present moment, as other streaming workers are already
					// handling them. Performing this sync at the same time would cause
					// conflicts and inconsistencies.
					const presentMomentStart = Dates.now('utc').minus({ hours: 2 }).unix_milliseconds;
					const presentMomentEnd = Dates.now('utc').plus({ hours: 2 }).unix_milliseconds;
					// Check if the chunk is within the present moment
					if (chunk.start >= presentMomentStart && chunk.start <= presentMomentEnd) {
						Logger.info({ message: `Skipping chunk ${chunk.start} as it starts within the present moment.` });
						return;
					}
					if (chunk.end >= presentMomentStart && chunk.end <= presentMomentEnd) {
						Logger.info({ message: `Skipping chunk ${chunk.end} as it ends within the present moment.` });
						return;
					}
					// If the chunk is not within the present moment, sync it
					await syncRides(chunk);
				} catch (error) {
					// Verify if the error is related to
					// the distinct query being too big
					const keywords = ['distinct', 'too', 'big'];
					if (!keywords.some(keyword => error.message?.toLowerCase().includes(keyword))) throw error;
					Logger.info({ message: `Distinct query too big — splitting chunk into smaller chunks... (${error.message})` });
					// If it is, we need to repeat the process by splitting
					// the current chunk into smaller chunks
					await performInTimeChunks({
						endDate: chunk.end,
						intervalHrs: 6,
						onChunk: async chunk => await syncRides(chunk),
						order: 'desc',
						startDate: chunk.start,
					});
				}
			},
			order: 'desc',
			startDate: earliestRide.start_time_scheduled,
		});

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		Logger.critical({ error: err, message: 'An error occurred. Halting execution.' });
	}
}

/* * */

await runOnInterval(main, { intervalMs: '1h' });
