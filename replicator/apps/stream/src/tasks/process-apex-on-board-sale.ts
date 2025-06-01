/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@helperkits/writer';
import { rides, simplifiedApexOnBoardSales } from '@tmlmobilidade/interfaces';
import { parseSimplifiedApexOnBoardSale } from '@tmlmobilidade/sae-replicator-pckg-parse';
import { getStandardWindowInterval } from '@tmlmobilidade/sae-replicator-pckg-utils';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/types';

/* * */

const simplifiedApexOnBoardSalesDbWritter = new MongoDbWriter<SimplifiedApexOnBoardSale>({
	batch_size: 250,
	batch_timeout: 10000,
	collection: await simplifiedApexOnBoardSales.getCollection(),
	idle_timeout: 10000,
});

/* * */

export async function processApexOnBoardSale(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		LOGGER.error(`WARNING: processApexOnBoardSale with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Check if the document is a valid Apex OnBoard Sale document.

	const expectedApexTransactionType = 3; // Sale Transaction
	const expectedCardPhysicalType = 28; // OnBoard Transaction

	if (!databaseOperation?.fullDocument?.transaction) return;
	if (databaseOperation.fullDocument.transaction.apexTransactionType !== expectedApexTransactionType) return;
	if (databaseOperation.fullDocument.transaction.cardPhysicalType !== expectedCardPhysicalType) return;

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.

	const newSimplifiedApexOnBoardSaleDocument = parseSimplifiedApexOnBoardSale(databaseOperation.fullDocument);

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<SimplifiedApexOnBoardSale>[]) => {
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
	// Write the new vehicle event document to the SimplifiedApexOnBoardSales collection

	await simplifiedApexOnBoardSalesDbWritter.write(newSimplifiedApexOnBoardSaleDocument, { filter: { _id: newSimplifiedApexOnBoardSaleDocument._id }, upsert: true }, () => null, flushCallback);

	//
};
