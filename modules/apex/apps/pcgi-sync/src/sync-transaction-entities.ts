/* * */

import { pcgiTransactionEntities, rawApexTransactions } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { parsePcgiTransactionEntityIntoRawApexTransaction } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type RawApexTransaction } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { BatchWriter, type PerformInTimeChunksItem } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<RawApexTransaction>({
	batch_size: 10_000,
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
 * Syncs Transaction Entities from the PCGI database
 * to the MongoDB database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncTransactionEntities(timeChunk: PerformInTimeChunksItem) {
	//

	const chunkStartDate = Dates
		.fromUnixTimestamp(timeChunk.start)
		.setZone('Europe/Lisbon', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixTimestamp(timeChunk.end)
		.setZone('Europe/Lisbon', 'offset_only');

	Logger.spacer(1);
	Logger.divider(`APEX Tx [${timeChunk.total - timeChunk.index}/${timeChunk.total}] - ${chunkEndDate.iso}[${chunkEndDate.unix_timestamp}] › ${chunkStartDate.iso}[${chunkStartDate.unix_timestamp}]`, 150);

	//
	// Setup the queries for both the source and destination databases,
	// to retrieve the distinct IDs for the current timestamp chunk.

	const sourceQuery = {
		createdAt: {
			$gte: chunkStartDate.js_date,
			$lte: chunkEndDate.js_date,
		},
	};

	//
	// Get the distinct document IDs from the source database
	// and check which ones are missing in the destination database,
	// accross the entire database, so that we can sync only the missing ones.
	// This is necessary because the source database has duplicates on different dates,
	// so we need to check the entire destination database to find the missing ones.

	const distinctIdsTimer = new Timer();

	const sourceDbDistinctIds = await pcgiTransactionEntities.distinct('transactionId', sourceQuery);

	const matchingDocumentIds = await rawApexTransactions.findMany({ _id: { $in: sourceDbDistinctIds } }, { projection: { _id: 1 } });
	const matchingDocumentIdsUnique = new Set(matchingDocumentIds.map(doc => doc._id));

	const missingDocumentIds = sourceDbDistinctIds.filter(id => !matchingDocumentIdsUnique.has(id));

	if (missingDocumentIds.length === 0) {
		Logger.success(`[APEX Tx] MATCH: All ${sourceDbDistinctIds.length} distinct IDs from source database matched with destination database. (${distinctIdsTimer.get()})`);
		return;
	}

	Logger.info(`[APEX Tx] MISMATCH: Found ${missingDocumentIds.length} missing documents from source on destination database. (${distinctIdsTimer.get()})`);

	//
	// Sync all documents in the current timestamp chunk. We query the Source database for all documents
	// in the current timestamp chunk, parse them and write them to the Destination database.
	// This is done in batches, so that we don't overload the memory. The IDs are not checked on purpose
	// because they are impossible to calculate without fetching and parsing all documents,
	// so we just upsert them in the Destination database and the DB takes care of deduplication.

	const pcgidbTransactionEntitiesCollection = await pcgiTransactionEntities.getCollection();

	const pcgidbTransactionEntitiesStream = pcgidbTransactionEntitiesCollection.find({ transactionId: { $in: missingDocumentIds } }).stream();

	for await (const document of pcgidbTransactionEntitiesStream) {
		try {
			// Transform the document into a RawApexTransaction
			const parsedDocument = parsePcgiTransactionEntityIntoRawApexTransaction(document);
			await writer.write(parsedDocument);
		} catch (error) {
			Logger.error(`Error transforming APEX Transaction: ${document.transactionId} Reason: ${error.message}`);
		}
	}

	await writer.flush();

	//
};
