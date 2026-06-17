/* * */

import { syncVehicleEvents } from '@/task.js';
import { getEarliestDate } from '@tmlmobilidade/consts';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	try {
		//

		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.startNodeLogs({ app: 'clickhouse-sync', message: 'Sentry Tracker Clickhouse Sync initialized', module: 'tracker', severity: 'info' });
		} catch (error) {
			Logger.error({ error, message: 'Error initializing Sentry Tracker Clickhouse Sync' });
		}

		//
		// Initialize the logger

		Logger.init();

		const globalTimer = new Timer();

		//
		// Get the earliest date from which we have data to sync,
		// and perform the sync in time chunks until we reach the current date.

		const earliestDate = getEarliestDate();

		//
		// Divide the time range into chunks
		// and sync each one sequentially.

		await performInTimeChunks({
			onChunk: syncVehicleEvents,
			splitBy: { minutes: 5 },
			startDate: earliestDate.unix_timestamp,
		});

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		Logger.error({ error: err as Error, message: 'An error occurred while syncing clickhouse data.' });
		throw err;
	}
}

/* * */

await runOnInterval(main, { intervalMs: '5m', throwOnError: true });
