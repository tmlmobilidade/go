/* * */

import { Dates } from '@tmlmobilidade/dates';
import { parseSimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-replicator-pckg-parse';
import { rides, simplifiedApexOnBoardRefunds } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/types';
import { MongoDbWriter, type MongoDBWriterWriteOps } from '@tmlmobilidade/writers';

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
		Logger.error(`WARNING: processApexOnBoardRefund with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newSimplifiedApexOnBoardRefundDocument = parseSimplifiedApexOnBoardRefund(databaseOperation.fullDocument);
	if (!newSimplifiedApexOnBoardRefundDocument) {
		Logger.error(`Invalid APEX OnBoard Refund document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData: MongoDBWriterWriteOps<SimplifiedApexOnBoardRefund>[]) => {
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

			Logger.info(`Flush [simplified_apex_on_board_refunds]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

			//
		}
		catch (error) {
			Logger.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the SimplifiedApexOnBoardRefunds collection

	await simplifiedApexOnBoardRefundsDbWritter.write(newSimplifiedApexOnBoardRefundDocument, { filter: { _id: newSimplifiedApexOnBoardRefundDocument._id }, upsert: true }, () => null, flushCallback);

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexOnBoardRefundDocument.agency_id === '41') fetch('https://status.carrismetropolitana.pt/api/push/eQxccZISJfTCE7mSDQhodV2NVcarw3Ge');
	if (newSimplifiedApexOnBoardRefundDocument.agency_id === '42') fetch('https://status.carrismetropolitana.pt/api/push/XMDCLOEuYfaJyhkOCvwCZ1MUDDgF5xu7');
	if (newSimplifiedApexOnBoardRefundDocument.agency_id === '43') fetch('https://status.carrismetropolitana.pt/api/push/WPU6a61aIIf2g2bZrCWK7eVQOwchM0Gk');
	if (newSimplifiedApexOnBoardRefundDocument.agency_id === '44') fetch('https://status.carrismetropolitana.pt/api/push/bReYHiH3nq7FLENX5KRGdrECfZbTN9m6');

	//
};
