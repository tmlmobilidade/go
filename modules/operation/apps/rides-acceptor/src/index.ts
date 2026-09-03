/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { processRideAcceptanceChunk } from './process.js';

/* * */

const SYNC_DAYS_BACK = 3;

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'rides-acceptor', message: 'Sentry Rides Acceptor initialized', module: 'controller', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Rides Acceptor' });
}

async function main() {
	try {
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

		performInTimeChunks({
			endDate: Dates.now('Europe/Lisbon').minus({ seconds: 30 }).unix_milliseconds,
			intervalHrs: 2,
			onChunk: async (chunk) => {
				//
				// Process the chunk

				await processRideAcceptanceChunk(chunk);

				Logger.spacer(1);
				Logger.divider();
			},
			order: 'desc',
			startDate: Dates.now('Europe/Lisbon').minus({ days: SYNC_DAYS_BACK }).unix_milliseconds,
		});

		Logger.success(`Finished running Rides Acceptor. (${globalTimer.get()})`);
	} catch (error) {
		Logger.error({ error, message: 'An error occurred. Halting execution.' });
	}
}

await runOnInterval(main, { intervalMs: '10m' });
