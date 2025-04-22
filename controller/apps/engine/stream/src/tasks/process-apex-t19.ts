/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@helperkits/writer';
import { apexT19, rides } from '@tmlmobilidade/interfaces';
import { parseApexT19 } from '@tmlmobilidade/sae-controller-pckg-parse';
import { getStandardWindowInterval } from '@tmlmobilidade/sae-controller-pckg-utils';
import { type ApexT19 } from '@tmlmobilidade/types';

/* * */

const apexT19DbWritter = new MongoDbWriter<ApexT19>({
	batch_size: 250,
	batch_timeout: 10000,
	collection: await apexT19.getCollection(),
	idle_timeout: 10000,
});

/* * */

export async function processApexT19(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		LOGGER.error(`WARNING: processApexT19 called with operationType different than "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] ${databaseOperation.fullDocument.transaction.transactionId}`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.

	const newApexT19Document = parseApexT19(databaseOperation.fullDocument);

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<ApexT19>[]) => {
		try {
			const invalidationTimer = new TIMETRACKER();
			// Map the flushed data to the query that will be used to invalidate the rides
			const updates = flushedData.map((writeOp) => {
				const standardWindowInterval = getStandardWindowInterval(writeOp.data.created_at);
				return {
					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
					trip_id: writeOp.data.trip_id,
				};
			});
			// Invalidate all rides that are affected
			const result = await rides.updateMany({ $or: updates }, { system_status: 'pending' });
			// Log the number of rides that were marked as 'pending'
			LOGGER.info(`Flush [apex_t19]: Marked ${result.modifiedCount} Rides as 'pending' due to new apex_t19 data (${invalidationTimer.get()})`);
		}
		catch (error) {
			LOGGER.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the ApexT19s collection

	await apexT19DbWritter.write(newApexT19Document, { filter: { _id: newApexT19Document._id }, upsert: true }, () => null, flushCallback);

	//
};
