/* * */

import { rawApexTransactions } from '@tmlmobilidade/databases';
import { parsePcgiTransactionEntityIntoRawApexTransaction } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type RawApexTransaction } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<RawApexTransaction>({
	batch_size: 5_000,
	batch_timeout: 15_000,
	insertFn: async (data) => {
		const writeOps = data.map(doc => ({
			updateOne: {
				filter: { _id: doc._id },
				update: { $set: doc },
				upsert: true,
			},
		}));
		await rawApexTransactions.bulkWrite(writeOps);
	},
	title: await rawApexTransactions.getCollectionName(),
});

/**
 * Process the APEX Location database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexLocations collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Location document to be processed.
 * @returns A promise that resolves when the APEX Location document has been processed.
 */
export async function processPcgiTransactionEntity(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		return; // Logger.error(`WARNING: streamPcgiTransactionEntities with operationType != "insert": operationType="${databaseOperation.operationType}" [${databaseOperation.fullDocument.operatorLongId}] transactionId="${databaseOperation.fullDocument.transactionId}"`);
	}

	//
	// Transform the PCGI transaction entity into a RawApexTransaction
	// and write it to the database, using a batch writer.

	try {
		const parsedDocument = parsePcgiTransactionEntityIntoRawApexTransaction(databaseOperation.fullDocument);
		await writer.write(parsedDocument);
	} catch (error) {
		Logger.error({ message: `Error transforming APEX Transaction: ${databaseOperation.fullDocument.transaction.transactionId}: Reason: ${error.message}` });
	}

	//
};
