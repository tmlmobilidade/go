/* * */

import { parsePcgiVehicleEvent, TrackerVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-shared';
import { rawdbVehicleEvents } from '@tmlmobilidade/go-tracker-pckg-databases';
import { Logger } from '@tmlmobilidade/logger';
import { MongoDbWriter } from '@tmlmobilidade/writers';

/* * */

const writer = new MongoDbWriter<TrackerVehicleEvent>({
	batch_size: 500,
	batch_timeout: 10_000,
	collection: rawdbVehicleEvents.RawVehicleEvents,
	idle_timeout: 10_000,
});

/* * */

export async function processPcgiVehicleEvent(databaseOperation) {
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

	const parsedDocuments = parsePcgiVehicleEvent(databaseOperation.fullDocument);

	for (const parsedDocument of parsedDocuments) {
		await writer.write(parsedDocument, {
			filter: { _id: parsedDocument._id },
			upsert: true,
		});
	}

	//
};
