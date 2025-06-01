/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@helperkits/writer';
import { rides, simplifiedApexOnBoardRefunds } from '@tmlmobilidade/interfaces';
import { parseSimplifiedApexOnBoardRefund } from '@tmlmobilidade/sae-replicator-pckg-parse';
import { getStandardWindowInterval } from '@tmlmobilidade/sae-replicator-pckg-utils';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/types';

/* * */

const simplifiedApexOnBoardRefundsDbWritter = new MongoDbWriter<SimplifiedApexOnBoardRefund>({
	batch_size: 250,
	batch_timeout: 10000,
	collection: await simplifiedApexOnBoardRefunds.getCollection(),
	idle_timeout: 10000,
});

/* * */

export async function processApexOnBoardRefund(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		LOGGER.error(`WARNING: processApexOnBoardRefund with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Check if the document is a valid Apex OnBoard Refund document.

	const expectedApexTransactionType = 6; // Refund Transaction
	const expectedCardPhysicalType = 28; // OnBoard Transaction

	if (!databaseOperation?.fullDocument?.transaction) return;
	if (databaseOperation.fullDocument.transaction.apexTransactionType !== expectedApexTransactionType) return;
	if (databaseOperation.fullDocument.transaction.cardPhysicalType !== expectedCardPhysicalType) return;

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.

	const newSimplifiedApexOnBoardRefundDocument = parseSimplifiedApexOnBoardRefund(databaseOperation.fullDocument);

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<SimplifiedApexOnBoardRefund>[]) => {
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
			LOGGER.info(`Flush [simplified_apex_on_board_refunds]: Marked ${result.modifiedCount} Rides as 'pending' due to new simplified_apex_on_board_refunds data (${invalidationTimer.get()})`);
		}
		catch (error) {
			LOGGER.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the SimplifiedApexOnBoardRefunds collection

	await simplifiedApexOnBoardRefundsDbWritter.write(newSimplifiedApexOnBoardRefundDocument, { filter: { _id: newSimplifiedApexOnBoardRefundDocument._id }, upsert: true }, () => null, flushCallback);

	//
};
