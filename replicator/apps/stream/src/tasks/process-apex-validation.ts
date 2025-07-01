/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@helperkits/writer';
import { rides, simplifiedApexValidations, uniqueSams } from '@tmlmobilidade/interfaces';
import { parseSimplifiedApexValidation } from '@tmlmobilidade/sae-replicator-pckg-parse';
import { ProcessingStatus, type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

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
		LOGGER.error(`WARNING: processApexValidation with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newSimplifiedApexValidationDocument = parseSimplifiedApexValidation(databaseOperation.fullDocument);
	if (!newSimplifiedApexValidationDocument) {
		LOGGER.error(`Invalid APEX Validation document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<SimplifiedApexValidation>[]) => {
		try {
			//

			const invalidationTimer = new TIMETRACKER();

			//
			// Map the flushed data to the query that will be used to invalidate documents

			const updateRidesOps = flushedData.map((writeOp) => {
				const standardWindowInterval = Dates.fromUnixTimestamp(writeOp.data.created_at).std_window;
				return {
					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
					trip_id: writeOp.data.trip_id,
				};
			});

			const updateUniqueSamsOps = flushedData.map((writeOp) => {
				return { _id: writeOp.data.mac_sam_serial_number };
			});

			//
			// Invalidate all documents that are affected

			const updateRidesPromise = rides.updateMany({ $or: updateRidesOps }, { system_status: ProcessingStatus.Waiting });
			const updateUniqueSamsPromise = uniqueSams.updateMany({ $or: updateUniqueSamsOps }, { system_status: ProcessingStatus.Waiting });

			const [updateRidesResult, updateUniqueSamsResult] = await Promise.all([updateRidesPromise, updateUniqueSamsPromise]);

			LOGGER.info(`Flush [simplified_apex_validations]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides | ${updateUniqueSamsResult.modifiedCount} Unique SAMS (${invalidationTimer.get()})`);

			//
		}
		catch (error) {
			LOGGER.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the SimplifiedApexValidations collection

	await simplifiedApexValidationsDbWritter.write(newSimplifiedApexValidationDocument, { filter: { _id: newSimplifiedApexValidationDocument._id }, upsert: true }, () => null, flushCallback);

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexValidationDocument.agency_id === '41') fetch('https://uptime.betterstack.com/api/v1/heartbeat/YwYCawo9Jw1CrrqYDfJxTBeU');
	if (newSimplifiedApexValidationDocument.agency_id === '42') fetch('https://uptime.betterstack.com/api/v1/heartbeat/kKUC4oNPdCzkzrGdvrme2qFj');
	if (newSimplifiedApexValidationDocument.agency_id === '43') fetch('https://uptime.betterstack.com/api/v1/heartbeat/JbKYJFEncKTcitouz7fVZCki');
	if (newSimplifiedApexValidationDocument.agency_id === '44') fetch('https://uptime.betterstack.com/api/v1/heartbeat/8AqjCGLV34HeZSujBRHJbmg1');

	//
};
