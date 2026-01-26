/* eslint-disable @typescript-eslint/no-explicit-any */

/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

interface SyncToClickHouseOptions<T> {
	/**
	 * The ClickHouse ID key (column name) used to identify documents.
	 * Used for comparing which documents are missing.
	 */
	clickhouseIdKey: string

	/**
	 * The query/filter to apply when counting documents in ClickHouse.
	 * This should match the same time range or conditions as mongoQuery.
	 */
	clickhouseQuery?: Record<string, unknown>

	/**
	 * The ClickHouse writer instance to use for writing documents.
	 */
	clickhouseWriter: ClickHouseWriter<T>

	/**
	 * Whether to ensure the table exists before syncing.
	 * If true, will call ensureTable() on the writer.
	 * @default false
	 */
	ensureTable?: boolean

	/**
	 * The MongoDB collection to read from (source).
	 */
	mongoCollection: any

	/**
	 * The MongoDB ID key (field name) used to identify documents.
	 * Used for comparing which documents are missing.
	 */
	mongoIdKey: string

	/**
	 * The query to filter documents in MongoDB.
	 */
	mongoQuery: any
}

/* * */

/**
 * Syncs documents from MongoDB to ClickHouse.
 * Compares document counts and only syncs missing documents.
 */
export async function syncToClickHouse<T>({ clickhouseIdKey, clickhouseQuery, clickhouseWriter, ensureTable, mongoCollection, mongoIdKey, mongoQuery }: SyncToClickHouseOptions<T>) {
	try {
		//

		const globalTimer = new Timer();

		//
		// Ensure the table exists in ClickHouse if the option is enabled

		if (ensureTable) {
			await clickhouseWriter.ensureTable();
		}

		//
		// Count how many documents are matched in each database
		// for the given queries. If the document count is the same for both databases,
		// then we assume all documents are synced, and we can skip the rest of the process.

		const countQueryTimer = new Timer();

		const mongoDocCount = await mongoCollection.countDocuments(mongoQuery);
		const clickhouseDocCount = await clickhouseWriter.countDocuments(clickhouseQuery);

		if (mongoDocCount === clickhouseDocCount) {
			Logger.success(`MATCH: Found the same number of documents in both databases: ${mongoDocCount} MongoDB = ${clickhouseDocCount} ClickHouse (${countQueryTimer.get()})`);
			return;
		}

		Logger.info(`MISMATCH: Document count was different for both databases: ${mongoDocCount} MongoDB != ${clickhouseDocCount} ClickHouse (${countQueryTimer.get()})`);

		//
		// If the document count was different, then we check which documents are missing.
		// Instead of syncing all documents again, we check only the missing IDs. This is done
		// by getting the distinct IDs from each database and comparing them to find the missing ones.

		const distinctQueryTimer = new Timer();

		const mongoDocIds = await mongoCollection.distinct(mongoIdKey, mongoQuery);
		const mongoDocIdsUnique = new Set(mongoDocIds.map(String));

		const clickhouseDocIds = await clickhouseWriter.distinct<string>(clickhouseIdKey, clickhouseQuery);
		const clickhouseDocIdsUnique = new Set(clickhouseDocIds.map(String));

		const missingDocuments = mongoDocIds.filter((documentId: string) => !clickhouseDocIdsUnique.has(String(documentId)));

		Logger.info(`MongoDB Total: ${mongoDocCount} | MongoDB Unique: ${mongoDocIdsUnique.size} | MongoDB ▲: ${mongoDocCount - mongoDocIdsUnique.size} | ClickHouse Total: ${clickhouseDocCount} | ClickHouse Unique: ${clickhouseDocIdsUnique.size} | ClickHouse ▲: ${clickhouseDocCount - clickhouseDocIdsUnique.size} | ClickHouse Missing: ${missingDocuments.length} (${distinctQueryTimer.get()})`);

		//
		// If all documents are already synced, then we can skip the rest of the process.

		if (missingDocuments.length === 0) {
			Logger.success(`Chunk complete. All document IDs matched. (${distinctQueryTimer.get()})`);
			return;
		}

		//
		// If there are missing documents, then we sync them.
		// We query MongoDB for the missing documents and write them to ClickHouse.

		Logger.info(`Found ${missingDocuments.length} missing documents in ClickHouse. (${distinctQueryTimer.get()})`);

		const syncTimer = new Timer();
		let syncedCount = 0;

		const missingDocumentsStream = mongoCollection
			.find({ [mongoIdKey]: { $in: missingDocuments } })
			.batchSize(100_000)
			.stream();

		for await (const document of missingDocumentsStream) {
			await clickhouseWriter.write(document as T);
			syncedCount++;
		}

		//
		// Flush remaining documents to ClickHouse

		await clickhouseWriter.flush();

		Logger.success(`Complete! Synced ${syncedCount} new documents to ClickHouse. (sync: ${syncTimer.get()}) (total: ${globalTimer.get()})`);

		//
	}
	catch (err) {
		Logger.error('An error occurred while syncing to ClickHouse.', err);
		throw err;
	}
}
