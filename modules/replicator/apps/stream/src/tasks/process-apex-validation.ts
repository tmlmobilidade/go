/* * */

import { Dates } from '@tmlmobilidade/dates';
import { parseSimplifiedApexValidation } from '@tmlmobilidade/go-replicator-pckg-parse';
import { type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { rides, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@tmlmobilidade/writers';

/* * */

const simplifiedApexValidationsDbWritter = new MongoDbWriter<SimplifiedApexValidation>({
	batch_size: 250,
	batch_timeout: 10000,
	collection: await simplifiedApexValidations.getCollection(),
	idle_timeout: 10000,
});

/* * */

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
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<SimplifiedApexValidation>[]) => {
		try {
			//

			const invalidationTimer = new Timer();

			//
			// Map the flushed data to the query that will be used to invalidate documents

			const updateRidesOps = flushedData.map((writeOp) => {
				const standardWindowInterval = Dates.fromUnixTimestamp(writeOp.data.created_at).std_window;
				return {
					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
					trip_id: writeOp.data.trip_id,
				};
			});

			//
			// Invalidate all documents that are affected

			const updateRidesResult = await rides.updateMany({ $or: updateRidesOps }, { system_status: 'waiting' }, { returnResults: false });

			Logger.info(`Flush [simplified_apex_validations]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

			//
		} catch (error) {
			Logger.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new document to the SimplifiedApexValidations collection

	await simplifiedApexValidationsDbWritter.write(
		newSimplifiedApexValidationDocument,
		{ filter: { _id: newSimplifiedApexValidationDocument._id }, upsert: true },
		() => null, flushCallback,
	);

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexValidationDocument.agency_id === '41') await fetch('https://status.carrismetropolitana.pt/api/push/QRSatZitiBNIhTDneykCGV0PthvQoIUf');
	if (newSimplifiedApexValidationDocument.agency_id === '42') await fetch('https://status.carrismetropolitana.pt/api/push/uZTfvExA1yCpNZIXIzgvCmHdSquNi0lV');
	if (newSimplifiedApexValidationDocument.agency_id === '43') await fetch('https://status.carrismetropolitana.pt/api/push/Rp7hYCJKLL8h67IP07RDAXagwO5avchc');
	if (newSimplifiedApexValidationDocument.agency_id === '44') await fetch('https://status.carrismetropolitana.pt/api/push/Mnm5Rn3tJAXYVWb6I51eTA4xfpXJ3vqq');

	//
};
