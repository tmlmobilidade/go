/* * */

import { type ChangeStreamInsertDocument } from '@tmlmobilidade/go-clients-mongo';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { setRidesAsWaiting } from '@tmlmobilidade/go-tracker-pckg-callback';
import { PARSER_MAP } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { type RawVehicleEvent, type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: 500,
	batch_timeout: 500,
	idle_timeout: 500,
	insertFn: async (data) => {
		await labDb.operation.vehicleEvents.insert('JSONEachRow', data);
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
	try {
		//

		//
		// Extract the full document from the database operation and transform it
		// into a simplified vehicle event document using the appropriate parser based on the version field.

		const parser = PARSER_MAP[databaseOperation.fullDocument.version];
		if (!parser) throw new Error(`No parser found for version ${databaseOperation.fullDocument.version}. Skipping document with _id "${databaseOperation.fullDocument._id}"...`);

		const newSimplifiedVehicleEventDocument = parser(databaseOperation.fullDocument);
		if (!newSimplifiedVehicleEventDocument) throw new Error(`Failed to parse document with _id "${databaseOperation.fullDocument._id}". Skipping...`);

		//
		// Write the new vehicle event document to the SimplifiedVehicleEvents collection

		await writer.write(newSimplifiedVehicleEventDocument, { flushCallback: setRidesAsWaiting });

		//
	} catch (error) {
		Logger.error({ error, message: `An error occurred while parsing a document: ${error.message}` });
	}
};
