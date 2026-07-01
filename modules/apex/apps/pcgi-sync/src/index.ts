/* * */

import { syncPcgiTransactionEntities } from '@/task.js';
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
		Logger.startNodeLogs({ app: 'pcgi-sync', message: 'Sentry APEX PCGI Sync initialized', module: 'apex', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry APEX PCGI Sync' });
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
			onChunk: async (chunk) => {
				try {
					await syncPcgiTransactionEntities(chunk);
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
						onChunk: async (chunk) => {
							await syncPcgiTransactionEntities(chunk);
						},
						splitBy: { minutes: 5 },
						startDate: chunk.start,
					});
				}
			},
			splitBy: { hours: 1 },
			startDate: earliestDate.unix_timestamp,
		});

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		console.log('An error occurred. Halting execution.', err);
	}
}

/* * */

await runOnInterval(main, { intervalMs: '30m', throwOnError: true });
