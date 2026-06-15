/* * */

import { Dates } from '@tmlmobilidade/dates';
import { parseSimplifiedApexLocation } from '@tmlmobilidade/go-replicator-pckg-parse';
import { type SimplifiedApexLocation } from '@tmlmobilidade/go-types-apex';
import { rides, simplifiedApexLocations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@tmlmobilidade/writers';

/* * */

const simplifiedApexLocationsDbWritter = new MongoDbWriter<SimplifiedApexLocation>({
	batch_size: 250,
	batch_timeout: 10000,
	collection: await simplifiedApexLocations.getCollection(),
	idle_timeout: 10000,
});

/* * */

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
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<SimplifiedApexLocation>[]) => {
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

			Logger.info(`Flush [simplified_apex_locations]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

			//
		} catch (error) {
			Logger.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new document to the SimplifiedApexLocations collection

	await simplifiedApexLocationsDbWritter.write(
		newSimplifiedApexLocationDocument,
		{ filter: { _id: newSimplifiedApexLocationDocument._id }, upsert: true },
		() => null, flushCallback,
	);

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexLocationDocument.agency_id === '41') await fetch('https://status.carrismetropolitana.pt/api/push/lyDgVjnFM9Q0Rmq2XI8rXCNdkTJDF6ap');
	if (newSimplifiedApexLocationDocument.agency_id === '42') await fetch('https://status.carrismetropolitana.pt/api/push/tk8zt1vosRuR3Bbq92lBqzRLMdsO47UK');
	if (newSimplifiedApexLocationDocument.agency_id === '43') await fetch('https://status.carrismetropolitana.pt/api/push/hyVcJagfcSybkuXq1qgYqMHpRUmPhym8');
	if (newSimplifiedApexLocationDocument.agency_id === '44') await fetch('https://status.carrismetropolitana.pt/api/push/pIqJwHHscWTLpG5850CeVFNbwnQGiAyk');

	//
};
