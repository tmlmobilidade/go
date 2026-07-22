/* * */

import { processVehicleEvent } from '@/task.js';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

/* * */

(async function init() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'pt-tml-cm-tst-labdb-stream', message: 'Sentry Tracker CM TST LabDb Stream initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker CM TST LabDb Stream' });
	}

	//
	// Watch for changes to the rawVehicleEventsNew collection
	// and integrate those documents immediately.

	const collection = await rawDb.vehicleEvents.ptTmlCmTst.getCollection();

	collection
		// Filter server-side so only insert operations traverse the stream.
		// This cuts stream volume and removes redundant client-side filtering.
		.watch([{ $match: { operationType: 'insert' } }])
		.on('change', async (change) => {
			//

			// Defensive: the $match guarantees inserts, but the driver's union
			// change type still allows missing fullDocument. Skip if absent.

			if (change.operationType !== 'insert' || !change.fullDocument) {
				Logger.error({ message: `[pt-tml-cm-tst-labdb-stream] WARNING: unexpected changeStream document: operationType="${change.operationType}"` });
				return;
			}

			// const nowMinus5Minutes = Dates.now('Europe/Lisbon').minus({ minutes: 5 }).unix_timestamp;

			// if (!change.fullDocument.created_at || change.fullDocument.created_at < nowMinus5Minutes) {
			// 	Logger.error({ message: `[clickhouse-stream] WARNING: changeStream document with missing or outdated created_at field: operationType="${change.operationType}" _id="${change.fullDocument._id}"` });
			// 	return;
			// }

			await processVehicleEvent(change);
		});

	//
})();
