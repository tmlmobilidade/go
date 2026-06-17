/* * */

import { processVehicleEvent } from '@/task.js';
import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';

/* * */

(async function init() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'clickhouse-stream', message: 'Sentry Tracker Clickhouse Stream initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker Clickhouse Stream' });
	}

	//
	// Watch for changes to the rawVehicleEventsNew collection
	// and integrate those documents immediately.

	const collection = await rawVehicleEventsNew.getCollection();

	collection
		.watch(/* [{ $match: { 'fullDocument.created_at': { $gt: Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp }, 'operationType': 'insert' } }], */)
		.on('change', async (change) => {
			//

			//
			// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
			// Only insert operations are expected to occur in this PCGIDB collection.

			if (change.operationType !== 'insert') {
				Logger.error({ message: `[clickhouse-stream] WARNING: changeStream document with operationType != "insert": operationType="${change.operationType}" _id="${change._id}"` });
				return;
			}

			if (!change.fullDocument) {
				Logger.error({ message: `[clickhouse-stream] WARNING: changeStream document with missing fullDocument: operationType="${change.operationType}" _id="${change._id}"` });
				return;
			}

			const nowMinus5Minutes = Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp;

			if (!change.fullDocument.created_at || change.fullDocument.created_at < nowMinus5Minutes) {
				Logger.error({ message: `[clickhouse-stream] WARNING: changeStream document with missing or outdated created_at field: operationType="${change.operationType}" _id="${change._id}"` });
				return;
			}

			await processVehicleEvent(change);
		});

	//
})();
