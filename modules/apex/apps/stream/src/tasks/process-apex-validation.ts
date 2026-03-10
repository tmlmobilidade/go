/* * */

import { clickhouseService } from '@tmlmobilidade/clickhouse';
import { parseSimplifiedApexValidation } from '@tmlmobilidade/go-apex-pckg-parse';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

const client = await clickhouseService.getClient();
const writer = new ClickHouseWriter<SimplifiedApexValidation>({
	client,
	table: 'simplified_apex_validations',
	tableSchema: simplifiedApexValidationsSchema,
});

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

	if (newSimplifiedApexValidationDocument.agency_id === '41') fetch('https://status.carrismetropolitana.pt/api/push/QRSatZitiBNIhTDneykCGV0PthvQoIUf');
	if (newSimplifiedApexValidationDocument.agency_id === '42') fetch('https://status.carrismetropolitana.pt/api/push/uZTfvExA1yCpNZIXIzgvCmHdSquNi0lV');
	if (newSimplifiedApexValidationDocument.agency_id === '43') fetch('https://status.carrismetropolitana.pt/api/push/Rp7hYCJKLL8h67IP07RDAXagwO5avchc');
	if (newSimplifiedApexValidationDocument.agency_id === '44') fetch('https://status.carrismetropolitana.pt/api/push/Mnm5Rn3tJAXYVWb6I51eTA4xfpXJ3vqq');

	//
};
