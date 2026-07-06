/* * */

import { syncApexInspectionDecisions } from '@/task.js';
import { getEarliestDate } from '@tmlmobilidade/consts';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'raw-sync-inspection-decisions', message: 'Sentry APEX Raw Sync Inspection Decisions initialized', module: 'apex', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry APEX Raw Sync Inspection Decisions' });
	}

	//
	try {
		//

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
			onChunk: syncApexInspectionDecisions,
			splitBy: { hours: 2 },
			startDate: earliestDate.unix_timestamp,
		});

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		console.log('An error occurred. Halting execution.', err);
	}
}

/* * */

await runOnInterval(main, { intervalMs: '30m' });
