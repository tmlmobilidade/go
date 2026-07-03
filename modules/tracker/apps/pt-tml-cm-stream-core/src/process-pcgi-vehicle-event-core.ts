/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { transformPcgiVehicleEventCore } from '@tmlmobilidade/go-tracker-pckg-shared';
import { Logger } from '@tmlmobilidade/logger';
import { type RawVehicleEvent } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<RawVehicleEvent>({
	batch_size: 500,
	batch_timeout: 500,
	idle_timeout: 500,
	insertFn: async (data) => {
		const writeOps = data.map(doc => ({
			updateOne: {
				filter: { _id: doc._id },
				update: { $set: doc },
				upsert: true,
			},
		}));
		await rawVehicleEventsNew.bulkWrite(writeOps);
	},
	title: await rawVehicleEventsNew.getCollectionName(),
});

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
		await writer.write(parsedDocument);
	}

	//
};
