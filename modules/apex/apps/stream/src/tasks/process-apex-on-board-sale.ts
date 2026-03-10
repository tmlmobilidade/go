/* * */

import { clickhouseService } from '@tmlmobilidade/clickhouse';
import { invalidateRides, parseSimplifiedApexOnBoardSale, simplifiedApexOnBoardSalesSchema } from '@tmlmobilidade/go-apex-pckg-common';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

const client = await clickhouseService.getClient();

const writer = new ClickHouseWriter<SimplifiedApexOnBoardSale>({
	client,
	table: 'simplified_apex_on_board_sales',
	tableSchema: simplifiedApexOnBoardSalesSchema,
});

/**
 * Process the APEX OnBoardSale database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexOnBoardSales collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX OnBoardSale document to be processed.
 * @returns A promise that resolves when the APEX OnBoardSale document has been processed.
 */
export async function processApexOnBoardSale(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error(`WARNING: processApexOnBoardSale with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newSimplifiedApexOnBoardSaleDocument = parseSimplifiedApexOnBoardSale(databaseOperation.fullDocument);

	if (!newSimplifiedApexOnBoardSaleDocument) {
		Logger.error(`Invalid APEX OnBoardSale document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Write the new vehicle event document to the SimplifiedApexOnBoardSales collection

	await writer.write(newSimplifiedApexOnBoardSaleDocument, { flushCallback: invalidateRides });

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexOnBoardSaleDocument.agency_id === '41') await fetch('https://status.carrismetropolitana.pt/api/push/QRSatZitiBNIhTDneykCGV0PthvQoIUf');
	if (newSimplifiedApexOnBoardSaleDocument.agency_id === '42') await fetch('https://status.carrismetropolitana.pt/api/push/uZTfvExA1yCpNZIXIzgvCmHdSquNi0lV');
	if (newSimplifiedApexOnBoardSaleDocument.agency_id === '43') await fetch('https://status.carrismetropolitana.pt/api/push/Rp7hYCJKLL8h67IP07RDAXagwO5avchc');
	if (newSimplifiedApexOnBoardSaleDocument.agency_id === '44') await fetch('https://status.carrismetropolitana.pt/api/push/Mnm5Rn3tJAXYVWb6I51eTA4xfpXJ3vqq');

	//
};
