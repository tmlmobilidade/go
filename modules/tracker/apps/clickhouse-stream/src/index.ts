/* * */

import { processVehicleEvent } from '@/task.js';
import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const DEFAULT_CONCURRENCY = 16;

(async function init() {
	//

	//
	// Watch for changes to the rawVehicleEventsNew collection
	// and integrate those documents immediately.

	const collection = await rawVehicleEventsNew.getCollection();

	const changeStream = collection.watch();
	const inFlight = new Set<Promise<void>>();

	for await (const change of changeStream) {
		//

		//
		// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
		// Only insert operations are expected to occur in this PCGIDB collection.

		if (change.operationType !== 'insert') {
			Logger.error(`[clickhouse-stream] WARNING: changeStream document with operationType != "insert": operationType="${change.operationType}" _id="${change._id}"`);
			continue;
		}

		const taskPromise = processVehicleEvent(change)
			.catch((error) => {
				Logger.error(`[clickhouse-stream] Error processing vehicle event: ${(error as Error).message}`);
			})
			.finally(() => {
				inFlight.delete(taskPromise);
			});

		inFlight.add(taskPromise);

		if (inFlight.size >= DEFAULT_CONCURRENCY) {
			await Promise.race(inFlight);
		}
	}

	await Promise.allSettled([...inFlight]);

	//
})();
