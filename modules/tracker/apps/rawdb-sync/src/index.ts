/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/utils';

import { syncVehicleEvents } from './task.js';
import { SyncConfig } from './types.js';

/* * */

export const syncConfig = [

	{ agency_id: 'A2L1N', collection: rawDb.vehicleEvents.ptTmlCmAlsa },

] as const satisfies SyncConfig[];

/* * */

async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'raw-sync-banking-taps', message: 'Sentry APEX Raw Sync Banking Taps initialized', module: 'apex', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry APEX Raw Sync Banking Taps' });
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
				for (const configItem of syncConfig) {
					await syncVehicleEvents(chunk, configItem);
				}
			},
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
