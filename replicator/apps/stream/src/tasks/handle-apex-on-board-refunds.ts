/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@helperkits/writer';
import { rides, simplifiedApexOnBoardRefunds } from '@tmlmobilidade/interfaces';
import { simplifyApexOnBoardRefund } from '@tmlmobilidade/sae-replicator-pckg-parse';
import { getStandardWindowInterval } from '@tmlmobilidade/sae-replicator-pckg-utils';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/types';

/* * */

const apexT3DbWritter = new MongoDbWriter<SimplifiedApexOnBoardRefund>({
	batch_size: 250,
	batch_timeout: 10000,
	collection: await simplifiedApexOnBoardRefunds.getCollection(),
	idle_timeout: 10000,
});

/* * */

export async function handleApexOnBoardRefunds(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		LOGGER.error(`WARNING: handleApexOnBoardRefunds with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.

	const newApexT3Document = simplifyApexOnBoardRefund(databaseOperation.fullDocument);

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<SimplifiedApexOnBoardRefund>[]) => {
		try {
			const invalidationTimer = new TIMETRACKER();
			// Map the flushed data to the query that will be used to invalidate the rides
			const updates = flushedData.map((writeOp) => {
				const standardWindowInterval = getStandardWindowInterval(writeOp.data._go_default__created_at);
				return {
					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
					trip_id: writeOp.data._go_enriched__journey_id,
				};
			});
			// Invalidate all rides that are affected
			const result = await rides.updateMany({ $or: updates }, { system_status: 'pending' });
			// Log the number of rides that were marked as 'pending'
			LOGGER.info(`Flush [apex_t11]: Marked ${result.modifiedCount} Rides as 'pending' due to new apex_t11 data (${invalidationTimer.get()})`);
		}
		catch (error) {
			LOGGER.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the ApexT3s collection

	await apexT3DbWritter.write(newApexT3Document, { filter: { _id: newApexT3Document._id }, upsert: true }, () => null, flushCallback);

	//
	// Publish the heartbeats for each agency

	// if (newApexT3Document.agency_id === '41') fetch('https://uptime.betterstack.com/api/v1/heartbeat/YwYCawo9Jw1CrrqYDfJxTBeU');
	// if (newApexT3Document.agency_id === '42') fetch('https://uptime.betterstack.com/api/v1/heartbeat/kKUC4oNPdCzkzrGdvrme2qFj');
	// if (newApexT3Document.agency_id === '43') fetch('https://uptime.betterstack.com/api/v1/heartbeat/JbKYJFEncKTcitouz7fVZCki');
	// if (newApexT3Document.agency_id === '44') fetch('https://uptime.betterstack.com/api/v1/heartbeat/8AqjCGLV34HeZSujBRHJbmg1');

	//
};
