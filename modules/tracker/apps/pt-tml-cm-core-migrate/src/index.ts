/* * */

import { syncPcgidbCoreVehicleEvents } from '@/sync-pcgidb-core.js';
import { getEarliestDate } from '@tmlmobilidade/consts';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	try {
		//

		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.startNodeLogs({ app: 'pt-tml-cm-core-sync', message: 'Sentry Tracker CM Sync Core initialized', module: 'tracker', severity: 'info' });
		} catch (error) {
			Logger.error({ error, message: 'Error initializing Sentry Tracker CM Sync Core' });
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

		await syncPcgidbCoreVehicleEvents(chunk);

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		console.log('An error occurred. Halting execution.', err);
	}
}

/* * */

await runOnInterval(main, { intervalMs: '30m', throwOnError: true });
