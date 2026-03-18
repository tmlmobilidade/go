/* * */

import { syncApexValidations } from '@/task.js';
import { getEarliestDate } from '@tmlmobilidade/consts';
import { pcgidbValidations } from '@tmlmobilidade/go-apex-pckg-databases';
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
		// Connect to the source database

		await pcgidbValidations.connect();

		//
		// Get the earliest date from which we have data to sync,
		// and perform the sync in time chunks until we reach the current date.

		const earliestDate = getEarliestDate();

		//
		// Divide the time range into chunks
		// and sync each one sequentially.

		await performInTimeChunks({
			onChunk: syncApexValidations,
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

await runOnInterval(main, 1_800_000); // 30 minutes
