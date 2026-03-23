/* * */

import { simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { invalidateRides, PARSER_MAP } from '@tmlmobilidade/go-tracker-pckg-common';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/writers';

/* * */

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: 50_000,
	insertFn: async (data) => {
		await simplifiedVehicleEventsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedVehicleEventsNew.getTableName(),
});

/**
 * Process the Vehicle Event database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedVehicleEvents collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the Vehicle Event document to be processed.
 * @returns A promise that resolves when the Vehicle Event document has been processed.
 */
export async function processVehicleEvent(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error(`WARNING: processApexValidation with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const parser = PARSER_MAP[databaseOperation.fullDocument.version];
	const newSimplifiedVehicleEventDocument = parser(databaseOperation.fullDocument);

	if (!newSimplifiedVehicleEventDocument) {
		Logger.error(`Invalid APEX Validation document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Write the new vehicle event document to the SimplifiedVehicleEvents collection

	await writer.write(newSimplifiedVehicleEventDocument, { flushCallback: invalidateRides });

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedVehicleEventDocument.agency_id === '41') await fetch('https://status.carrismetropolitana.pt/api/push/QRSatZitiBNIhTDneykCGV0PthvQoIUf');
	if (newSimplifiedVehicleEventDocument.agency_id === '42') await fetch('https://status.carrismetropolitana.pt/api/push/uZTfvExA1yCpNZIXIzgvCmHdSquNi0lV');
	if (newSimplifiedVehicleEventDocument.agency_id === '43') await fetch('https://status.carrismetropolitana.pt/api/push/Rp7hYCJKLL8h67IP07RDAXagwO5avchc');
	if (newSimplifiedVehicleEventDocument.agency_id === '44') await fetch('https://status.carrismetropolitana.pt/api/push/Mnm5Rn3tJAXYVWb6I51eTA4xfpXJ3vqq');

	//
};
