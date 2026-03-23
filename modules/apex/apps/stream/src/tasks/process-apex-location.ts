/* * */

import { simplifiedApexLocationsNew } from '@tmlmobilidade/databases';
import { invalidateRides, parseSimplifiedApexLocation } from '@tmlmobilidade/go-apex-pckg-common';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedApexLocation } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/writers';

/* * */

const writer = new BatchWriter<SimplifiedApexLocation>({
	batch_size: 50_000,
	insertFn: async (data) => {
		await simplifiedApexLocationsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexLocationsNew.getTableName(),
});

/**
 * Process the APEX Location database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexLocations collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Location document to be processed.
 * @returns A promise that resolves when the APEX Location document has been processed.
 */
export async function processApexLocation(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error(`WARNING: processApexLocation with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newSimplifiedApexLocationDocument = parseSimplifiedApexLocation(databaseOperation.fullDocument);

	if (!newSimplifiedApexLocationDocument) {
		Logger.error(`Invalid APEX Location document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Write the new vehicle event document to the SimplifiedApexLocations collection

	await writer.write(newSimplifiedApexLocationDocument, { flushCallback: invalidateRides });

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexLocationDocument.agency_id === '41') await fetch('https://status.carrismetropolitana.pt/api/push/QRSatZitiBNIhTDneykCGV0PthvQoIUf');
	if (newSimplifiedApexLocationDocument.agency_id === '42') await fetch('https://status.carrismetropolitana.pt/api/push/uZTfvExA1yCpNZIXIzgvCmHdSquNi0lV');
	if (newSimplifiedApexLocationDocument.agency_id === '43') await fetch('https://status.carrismetropolitana.pt/api/push/Rp7hYCJKLL8h67IP07RDAXagwO5avchc');
	if (newSimplifiedApexLocationDocument.agency_id === '44') await fetch('https://status.carrismetropolitana.pt/api/push/Mnm5Rn3tJAXYVWb6I51eTA4xfpXJ3vqq');

	//
};
