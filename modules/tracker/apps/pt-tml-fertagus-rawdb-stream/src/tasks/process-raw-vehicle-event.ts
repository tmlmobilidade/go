/* * */

import { type ChangeStreamDocument } from '@tmlmobilidade/go-clients-mongo';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { setRidesAsWaiting } from '@tmlmobilidade/go-tracker-pckg-callback';
import { parseRawVehicleEventPtTmlFertagusV1 } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { type RawVehicleEventPtTmlFertagus, type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
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
	title: 'pt-tml-fertagus-rawdb-stream',
});

/**
 * Transforms a newly inserted Fertagus RawVehicleEvent into a SimplifiedVehicleEvent
 * (matching it to a Ride) and writes it to the LabDb through the batch writer.
 * @param change The change stream document emitted by the RawVehicleEvents collection
 */
export async function processRawVehicleEvent(change: ChangeStreamDocument<RawVehicleEventPtTmlFertagus>) {
	//

	//
	// Only insert operations with a full document are expected

	if (change.operationType !== 'insert' || !change.fullDocument) {
		Logger.error({ message: `[pt-tml-fertagus-rawdb-stream] WARNING: unexpected changeStream document: operationType="${change.operationType}"` });
		return;
	}

	//
	// Parse the document and write it to the SimplifiedVehicleEvents table

	try {
		const simplified = await parseRawVehicleEventPtTmlFertagusV1(change.fullDocument);
		if (!simplified) return;

		await writer.write(simplified, { flushCallback: setRidesAsWaiting });
	} catch (error) {
		Logger.error({ error, message: `[pt-tml-fertagus-rawdb-stream] Failed to transform document _id="${change.fullDocument._id}"` });
	}

	//
}
