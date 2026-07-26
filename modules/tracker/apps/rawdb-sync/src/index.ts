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
	{ agency_id: 'G8N1G', collection: rawDb.vehicleEvents.esCrtmAisa },
	{ agency_id: 'DFS5M', collection: rawDb.vehicleEvents.esCrtmLaVeloz },
	{ agency_id: 'IA9T6', collection: rawDb.vehicleEvents.ptTmlCcfl },
	{ agency_id: 'A2L1N', collection: rawDb.vehicleEvents.ptTmlCmAlsa },
	{ agency_id: 'BNA17', collection: rawDb.vehicleEvents.ptTmlCmRl },
	{ agency_id: 'YA15B', collection: rawDb.vehicleEvents.ptTmlCmTst },
	{ agency_id: 'LA77N', collection: rawDb.vehicleEvents.ptTmlCmVa },
	{ agency_id: 'N18KL', collection: rawDb.vehicleEvents.ptTmlCp },
	{ agency_id: '7NTB1', collection: rawDb.vehicleEvents.ptTmlFertagus },
	{ agency_id: 'IA2N9', collection: rawDb.vehicleEvents.ptTmlMl },
	{ agency_id: 'HF16N', collection: rawDb.vehicleEvents.ptTmlMobi },
	{ agency_id: 'A3H3M', collection: rawDb.vehicleEvents.ptTmlTcb },
	{ agency_id: 'LTP61', collection: rawDb.vehicleEvents.ptTmlTtsl },
	{ agency_id: 'KJTOU', collection: rawDb.vehicleEvents.ptTmpUnirUt1 },
	{ agency_id: '1H6XC', collection: rawDb.vehicleEvents.ptTmpUnirUt2 },
	{ agency_id: 'OP1VZ', collection: rawDb.vehicleEvents.ptTmpUnirUt3 },
	{ agency_id: 'VZAS3', collection: rawDb.vehicleEvents.ptTmpUnirUt4 },
	{ agency_id: '8NDX4', collection: rawDb.vehicleEvents.ptTmpUnirUt5 },
	{ agency_id: '0AMEO', collection: rawDb.vehicleEvents.ptTmpUnirUt6 },
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
