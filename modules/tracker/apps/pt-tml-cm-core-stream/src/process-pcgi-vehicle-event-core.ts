/* * */

import { transformPcgiVehicleEventCore } from '@tmlmobilidade/go-tracker-pckg-shared';
import { Logger } from '@tmlmobilidade/logger-logger-backend';

import { alsaWriter, rlWriter, tstWriter, vaWriter } from './writers.js';

/* * */

export async function processPcgiVehicleEventCore(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error({ message: `WARNING: processApexLocation with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"` });
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const parsedDocuments = transformPcgiVehicleEventCore(databaseOperation.fullDocument);

	for (const parsedDocument of parsedDocuments) {
		if (parsedDocument.agency_id === 'LA77N') await vaWriter.write(parsedDocument);
		if (parsedDocument.agency_id === 'BNA17') await rlWriter.write(parsedDocument);
		if (parsedDocument.agency_id === 'YA15B') await tstWriter.write(parsedDocument);
		if (parsedDocument.agency_id === 'A2L1N') await alsaWriter.write(parsedDocument);
	}

	//
};
