/* * */

import { invalidateRides, parseSimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-apex-pckg-common';
import { simplifiedApexOnBoardRefundsNew } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/writers';

/* * */

const writer = new BatchWriter<SimplifiedApexOnBoardRefund>({
	batch_size: 50_000,
	insertFn: async (data) => {
		await simplifiedApexOnBoardRefundsNew.insert('JSONEachRow', data);
	},
	title: simplifiedApexOnBoardRefundsNew.tableName,
});

/**
 * Process the APEX OnBoardRefund database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexOnBoardRefunds collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX OnBoardRefund document to be processed.
 * @returns A promise that resolves when the APEX OnBoardRefund document has been processed.
 */
export async function processApexOnBoardRefund(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error(`WARNING: processApexOnBoardRefund with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newSimplifiedApexOnBoardRefundDocument = parseSimplifiedApexOnBoardRefund(databaseOperation.fullDocument);

	if (!newSimplifiedApexOnBoardRefundDocument) {
		Logger.error(`Invalid APEX OnBoardRefund document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Write the new vehicle event document to the SimplifiedApexOnBoardRefunds collection

	await writer.write(newSimplifiedApexOnBoardRefundDocument, { flushCallback: invalidateRides });

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexOnBoardRefundDocument.agency_id === '41') await fetch('https://status.carrismetropolitana.pt/api/push/QRSatZitiBNIhTDneykCGV0PthvQoIUf');
	if (newSimplifiedApexOnBoardRefundDocument.agency_id === '42') await fetch('https://status.carrismetropolitana.pt/api/push/uZTfvExA1yCpNZIXIzgvCmHdSquNi0lV');
	if (newSimplifiedApexOnBoardRefundDocument.agency_id === '43') await fetch('https://status.carrismetropolitana.pt/api/push/Rp7hYCJKLL8h67IP07RDAXagwO5avchc');
	if (newSimplifiedApexOnBoardRefundDocument.agency_id === '44') await fetch('https://status.carrismetropolitana.pt/api/push/Mnm5Rn3tJAXYVWb6I51eTA4xfpXJ3vqq');

	//
};
