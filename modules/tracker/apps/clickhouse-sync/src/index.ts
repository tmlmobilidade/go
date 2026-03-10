/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { performInTimeChunks, runOnInterval } from '@tmlmobilidade/utils';

import { syncVehicleEvents } from './task.js';

/* * */

async function main() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//

		const earliestDate = getEarliestDate();

		await performInTimeChunks({
			onChunk: syncVehicleEvents,
			splitBy: { hours: 4 },
			startDate: earliestDate.unix_timestamp,
		});

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		console.log('An error occurred. Halting execution.', err);
	}
}

/* * */
await runOnInterval(main, 300_000); // 5 minutes
