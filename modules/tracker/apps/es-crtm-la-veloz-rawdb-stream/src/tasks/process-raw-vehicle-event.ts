/* * */

import { type ChangeStreamDocument } from '@tmlmobilidade/go-clients-mongo';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { setRidesAsWaiting } from '@tmlmobilidade/go-tracker-pckg-callback';
import { handleStreamRawVehicleEventIntoSimplifiedVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { type RawVehicleEventEsCrtmLaVeloz, type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: 1_000,
	batch_timeout: 250,
	idle_timeout: 250,
	insertFn: async (data) => {
		await labDb.operation.simplifiedVehicleEvents.insert('JSONEachRow', data);
	},
	title: 'es-crtm-la-veloz-rawdb-stream',
});

/**
 * Transforms a newly inserted CRTM La Veloz RawVehicleEvent into a SimplifiedVehicleEvent
 * and writes it to the LabDb through the batch writer.
 * @param change The change stream document emitted by the RawVehicleEvents collection
 */
export async function processRawVehicleEvent(change: ChangeStreamDocument<RawVehicleEventEsCrtmLaVeloz>) {
	//

	//
	// Only insert operations with a full document are expected

	if (change.operationType !== 'insert' || !change.fullDocument) {
		Logger.error({ message: `[es-crtm-la-veloz-rawdb-stream] WARNING: unexpected changeStream document: operationType="${change.operationType}"` });
		return;
	}

	//
	// Parse the document and write it to the SimplifiedVehicleEvents table

	await handleStreamRawVehicleEventIntoSimplifiedVehicleEvent({
		batchWriter: writer,
		databaseOperation: change,
		flushCallback: setRidesAsWaiting,
	});

	//
}
