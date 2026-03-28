/* * */

import { syncVehicleEvents } from '@/task.js';
import { getEarliestDate } from '@tmlmobilidade/consts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
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
			onChunk: syncVehicleEvents,
			splitBy: { minutes: 3 },
			startDate: earliestDate.unix_timestamp,
		});

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		Logger.error('An error occurred while syncing clickhouse data.', err as Error);
		throw err;
	}
}

/* * */

await runOnInterval(main, 300_000); // 5 minutes
