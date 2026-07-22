/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { setRidesAsWaiting } from '@tmlmobilidade/go-tracker-pckg-callback';
import { parseRawVehicleEventIntoSimplifiedVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: 5_000,
	batch_timeout: 1_000,
	idle_timeout: 1_000,
	insertFn: async (data) => {
		await labDb.operation.vehicleEvents.insert('JSONEachRow', data);
	},
	title: `pt-tml-cm-alsa-rawdb-stream`,
});

/* * */

(async function init() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'pt-tml-cm-alsa-rawdb-stream', message: 'Sentry Tracker CRTM AISA LabDb Stream initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker CRTM AISA LabDb Stream' });
	}

	//
	// Watch for changes to the rawVehicleEventsNew collection
	// and integrate those documents immediately.

	const collection = await rawDb.vehicleEvents.ptTmlCmAlsa.getCollection();

	collection
		.watch([{ $match: { operationType: 'insert' } }])
		.on('change', async (change) => {
			//

			if (change.operationType !== 'insert' || !change.fullDocument) {
				Logger.error({ message: `[pt-tml-cm-alsa-rawdb-stream] WARNING: unexpected changeStream document: operationType="${change.operationType}"` });
				return;
			}

			await parseRawVehicleEventIntoSimplifiedVehicleEvent({
				batchWriter: writer,
				databaseOperation: change,
				flushCallback: setRidesAsWaiting,
			});
		});
})();
