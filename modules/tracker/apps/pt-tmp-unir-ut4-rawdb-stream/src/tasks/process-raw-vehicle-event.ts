/* * */

import { type ChangeStreamDocument } from '@tmlmobilidade/go-clients-mongo';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { setRidesAsWaiting } from '@tmlmobilidade/go-tracker-pckg-callback';
import { handleStreamRawVehicleEventIntoSimplifiedVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { type RawVehicleEventPtTmpUnirUt4, type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
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
	title: 'pt-tmp-unir-ut4-rawdb-stream',
});

/**
 * Transforms a newly inserted TMP UNIR UT4 RawVehicleEvent into a SimplifiedVehicleEvent
 * and writes it to the LabDb through the batch writer.
 * @param change The change stream document emitted by the RawVehicleEvents collection
 */
export async function processRawVehicleEvent(change: ChangeStreamDocument<RawVehicleEventPtTmpUnirUt4>) {
	//

	//
	// Only insert operations with a full document are expected

	if (change.operationType !== 'insert' || !change.fullDocument) {
		Logger.error({ message: `[pt-tmp-unir-ut4-rawdb-stream] WARNING: unexpected changeStream document: operationType="${change.operationType}"` });
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
