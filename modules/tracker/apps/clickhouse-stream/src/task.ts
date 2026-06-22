/* * */

import { simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { PARSER_MAP } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { invalidateRides } from '@tmlmobilidade/go-tracker-pckg-shared';
import { type ChangeStreamInsertDocument } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { RawVehicleEvent, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: 500,
	batch_timeout: 500,
	idle_timeout: 500,
	insertFn: async (data) => {
		await simplifiedVehicleEventsNew.insert('JSONEachRow', data);
	},
	title: `clickhouse-stream-${Math.random().toString(36).substring(2, 15)}`,
});

/**
 * Process the Vehicle Event database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedVehicleEvents collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the Vehicle Event document to be processed.
 * @returns A promise that resolves when the Vehicle Event document has been processed.
 */
export async function processVehicleEvent(databaseOperation: ChangeStreamInsertDocument<RawVehicleEvent>) {
	//

	//
	// Extract the full document from the database operation and transform it
	// into a simplified vehicle event document using the appropriate parser based on the version field.

	const parser = PARSER_MAP[databaseOperation.fullDocument.version];
	const newSimplifiedVehicleEventDocument = parser(databaseOperation.fullDocument);

	if (!newSimplifiedVehicleEventDocument) {
		Logger.error({ message: `Invalid Vehicle Event document, skipping operation: ${databaseOperation.fullDocument._id}` });
		return;
	}

	//
	// Write the new vehicle event document to the SimplifiedVehicleEvents collection

	await writer.write(newSimplifiedVehicleEventDocument, { flushCallback: invalidateRides });

	//
};
