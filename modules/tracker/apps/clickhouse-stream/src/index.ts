/* * */

import { processVehicleEvent } from '@/task.js';
import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';

/* * */

(async function init() {
	//

	//
	// Watch for changes to the rawVehicleEventsNew collection
	// and integrate those documents immediately.

	const collection = await rawVehicleEventsNew.getCollection();

	collection
		.watch()
		.on('change', async (change) => {
			//

		//
		// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
		// Only insert operations are expected to occur in this PCGIDB collection.

		if (change.operationType !== 'insert') {
			Logger.error(`[clickhouse-stream] WARNING: changeStream document with operationType != "insert": operationType="${change.operationType}" _id="${change._id}"`);
			continue;
		}

		if (!change.fullDocument) {
			Logger.error(`[clickhouse-stream] WARNING: changeStream document with missing fullDocument: operationType="${change.operationType}" _id="${change._id}"`);
			continue;
		}

		const nowMinus5Minutes = Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp;

		if (!change.fullDocument.created_at || change.fullDocument.created_at < nowMinus5Minutes) {
			Logger.error(`[clickhouse-stream] WARNING: changeStream document with missing or outdated created_at field: operationType="${change.operationType}" _id="${change._id}"`);
			continue;
		}

		await processVehicleEvent(change);
	}

	//
})();
