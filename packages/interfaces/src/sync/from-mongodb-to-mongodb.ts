/* eslint-disable @typescript-eslint/no-explicit-any */

/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type MongoDbWriter, type MongoDBWriterWriteOps } from '@tmlmobilidade/writers';

/* * */

interface SyncDatabasesOptions<T> {

	/**
	 * The destination MongoDB Collection or ClickHouse
	 * table where the documents will be written.
	 */
	destCollection: any

	/**
	 * The type of the destination database, which can be either 'clickhouse' or 'mongodb'.
	 * This is used to determine how to handle certain operations that may differ
	 * between the two database types, such as writing documents or applying queries.
	 */
	destDbType: 'mongodb'

	/**
	 * The database writer instance to use for
	 * writing documents to the destination database.
	 * This can be either a ClickHouseWriter or a MongoDbWriter,
	 * depending on the destination database.
	 */
	destDbWriter: MongoDbWriter<T>

	/**
	 * The key in the destination database that represents the unique
	 * identifier of the document. This is used to compare documents
	 * between the source and destination databases.
	 */
	destIdKey: string

	/**
	 * The query to apply to the destination database when counting documents.
	 * This is used to filter the documents that will be considered for synchronization.
	 */
	destQuery: any

	/**
	 * The transformation function that takes a document from the source database
	 * and transforms it into the format required by the destination database.
	 * This function is called for each document that needs to be synced, and should
	 * return the transformed document that will be written to the destination database.
	 * @param srcDoc The document from the source database to be transformed.
	 * @returns The transformed document to be written to the destination database.
	 */
	docParser: (srcDoc: any) => T

	/**
	 * The callback function that is called after a batch of documents
	 * is written to the destination database. This function can be used to perform
	 * any necessary actions after the documents are written, such as logging,
	 * updating related data, or triggering other processes. The function receives
	 * an optional array of write operations that were performed, which can be used
	 * for further processing if needed.
	 * @param data An optional array of write operations that were performed.
	 * @returns A promise that resolves when the callback has completed.
	 */
	flushCallback: (data?: MongoDBWriterWriteOps<T>[]) => Promise<void>

	/**
	 * The source MongoDB Collection or ClickHouse table
	 * from which the documents will be read.
	 */
	srcCollection: any

	/**
	 * The key in the source database that represents the unique
	 * identifier of the document. This is used to compare documents
	 * between the source and destination databases.
	 */
	srcIdKey: string

	/**
	 * The query to apply to the source database when counting documents.
	 * This is used to filter the documents that will be considered for synchronization.
	 */
	srcQuery: any

}

/**
 * This function synchronizes documents between a source and destination database
 * by efficiently comparing document counts and IDs, and then writing any missing
 * documents from the source to the destination. It uses a provided document parser
 * to transform documents from the source format to the destination format, and a database
 * writer to perform the write operations. The function also includes error handling and logging
 * to track the synchronization process.
 * @param options An object containing the necessary options for synchronizing documents,
 * including database collections, queries, ID keys, a document parser, and a flush callback.
 */
export async function syncMongoDbToMongoDb<T>(options: SyncDatabasesOptions<T>) {
	try {
		//

		const globalTimer = new Timer();

		//
		// Count how many documents are matched in each database
		// for the given queries. If the document count is the same for both databases,
		// then we assume all documents are synced, and we can skip the rest of the process.

		const countQueryTimer = new Timer();

		const srcDocCount = await options.srcCollection.countDocuments(options.srcQuery);
		const destDocCount = await options.destCollection.countDocuments(options.destQuery);

		if (srcDocCount === destDocCount) {
			Logger.success(`MATCH: Found the same number of documents in both databases: ${srcDocCount} SRC = ${destDocCount} DEST (${countQueryTimer.get()})`);
			return;
		}

		Logger.info(`MISMATCH: Document count was different for both databases: ${srcDocCount} SRC != ${destDocCount} DEST (${countQueryTimer.get()})`);

		//
		// If the document count was different, then we check which documents are missing.
		// Instead of syncing all documents again, we check only the missing IDs. This is done
		// by getting the distinct IDs from each database and comparing them to find the missing ones.

		const distinctQueryTimer = new Timer();

		const srcDocIds = await options.srcCollection.distinct(options.srcIdKey, options.srcQuery);
		const srcDocIdsUnique = new Set(srcDocIds.map(String));

		const destDocIds = await options.destCollection.distinct(options.destIdKey, options.destQuery);
		const destDocIdsUnique = new Set(destDocIds.map(String));

		const missingDocuments = srcDocIds.filter((documentId: string) => !destDocIdsUnique.has(String(documentId)));
		const extraDocuments = destDocIds.filter((documentId: string) => !srcDocIdsUnique.has(String(documentId)));

		Logger.info(`SRC Total: ${srcDocCount} | SRC Unique: ${srcDocIdsUnique.size} | SRC ▲: ${srcDocCount - srcDocIdsUnique.size} | DEST Total: ${destDocCount} | DEST Unique: ${destDocIdsUnique.size} | DEST ▲: ${destDocCount - destDocIdsUnique.size} | DEST Missing: ${missingDocuments.length} | DEST Extra: ${extraDocuments.length} (${distinctQueryTimer.get()})`);

		//
		// If all documents are already synced, then we can skip the rest of the process.

		if (missingDocuments.length === 0) {
			Logger.success(`Chunk complete. All document IDs matched. (${distinctQueryTimer.get()})`);
		}

		//
		// If there are extra documents in the DEST database, then we remove them.

		if (extraDocuments.length > 0) {
			await options.destCollection.deleteMany({ [options.destIdKey]: { $in: extraDocuments }, ...options.destQuery });
			Logger.info(`Removed ${extraDocuments.length} extra documents in DEST. (${distinctQueryTimer.get()})`);
		}

		//
		// If there are missing documents, then we sync them.
		// We query the SRC database for the missing documents and write them to the DEST database.

		Logger.info(`Found ${missingDocuments.length} missing documents in DEST. (${distinctQueryTimer.get()})`);

		const missingDocumentsStream = options.srcCollection
			.find({ [options.srcIdKey]: { $in: missingDocuments } })
			.stream();

		for await (const srcDocument of missingDocumentsStream) {
			const parsedSrcDoc = options.docParser(srcDocument);
			if (!parsedSrcDoc) continue; // Skip if parsing failed
			if (options.destDbType === 'mongodb') {
				await options.destDbWriter.write(parsedSrcDoc, { filter: { [options.destIdKey]: parsedSrcDoc[options.destIdKey] }, upsert: true }, async () => { /**/ }, options.flushCallback);
			}
		}

		//
		// Flush the remaining documents in the writer to the database
		// and complete the sync process.

		if (options.destDbType === 'mongodb') {
			await options.destDbWriter.flush(options.flushCallback);
		}

		Logger.success(`Complete! Synced ${missingDocuments.length} new documents. (${globalTimer.get()})`);

		//
	}
	catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
};
