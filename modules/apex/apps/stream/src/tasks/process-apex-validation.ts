/* * */

import { invalidateRides, parseSimplifiedApexValidation } from '@tmlmobilidade/go-apex-pckg-common';
import { simplifiedApexValidationsNew } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/writers';

/* * */

const writer = new BatchWriter<SimplifiedApexValidation>({
	batch_size: 100,
	insertFn: async (data) => {
		await simplifiedApexValidationsNew.insert('JSONEachRow', data);
	},
	title: simplifiedApexValidationsNew.tableName,
});

/**
 * Process the APEX Validation database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexValidations collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Validation document to be processed.
 * @returns A promise that resolves when the APEX Validation document has been processed.
 */
export async function processApexValidation(databaseOperation) {
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

	const newSimplifiedApexValidationDocument = parseSimplifiedApexValidation(databaseOperation.fullDocument);

	if (!newSimplifiedApexValidationDocument) {
		Logger.error(`Invalid APEX Validation document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Write the new vehicle event document to the SimplifiedApexValidations collection

	await writer.write(newSimplifiedApexValidationDocument, { flushCallback: invalidateRides });

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexValidationDocument.agency_id === '41') await fetch('https://status.carrismetropolitana.pt/api/push/QRSatZitiBNIhTDneykCGV0PthvQoIUf');
	if (newSimplifiedApexValidationDocument.agency_id === '42') await fetch('https://status.carrismetropolitana.pt/api/push/uZTfvExA1yCpNZIXIzgvCmHdSquNi0lV');
	if (newSimplifiedApexValidationDocument.agency_id === '43') await fetch('https://status.carrismetropolitana.pt/api/push/Rp7hYCJKLL8h67IP07RDAXagwO5avchc');
	if (newSimplifiedApexValidationDocument.agency_id === '44') await fetch('https://status.carrismetropolitana.pt/api/push/Mnm5Rn3tJAXYVWb6I51eTA4xfpXJ3vqq');

	//
};
