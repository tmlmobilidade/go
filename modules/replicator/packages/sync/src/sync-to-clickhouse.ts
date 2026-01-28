/* eslint-disable @typescript-eslint/no-explicit-any */

/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

interface SyncToClickHouseOptions<T> {
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
	 * The query to filter documents in MongoDB.
	 */
	mongoQuery: any
}

/* * */

/**
 * Syncs documents from MongoDB to ClickHouse.
 * Compares document counts between databases. If counts match, assumes sync is complete.
 * If counts differ, syncs all documents from MongoDB for the given query.
 *
 * Note: This function does not use `distinct` to find specific missing documents
 * because MongoDB has a 16MB limit on distinct results, which is easily exceeded
 * with high-volume data like vehicle events.
 */
export async function syncToClickHouse<T>({ clickhouseQuery, clickhouseWriter, ensureTable, mongoCollection, mongoQuery }: SyncToClickHouseOptions<T>) {
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
		// If the document count was different, sync all documents from MongoDB.
		// We don't use `distinct` to find specific missing documents because MongoDB
		// has a 16MB limit on distinct results, which is easily exceeded with high-volume data.

		const syncTimer = new Timer();
		let syncedCount = 0;

		const documentsStream = mongoCollection
			.find(mongoQuery)
			.batchSize(100_000)
			.stream();

		for await (const document of documentsStream) {
			await clickhouseWriter.write(document as T);
			syncedCount++;
		}

		//
		// Flush remaining documents to ClickHouse

		await clickhouseWriter.flush();

		Logger.success(`Complete! Synced ${syncedCount} documents to ClickHouse. (sync: ${syncTimer.get()}) (total: ${globalTimer.get()})`);

		//
	}
	catch (err) {
		Logger.error('An error occurred while syncing to ClickHouse.', err);
		throw err;
	}
}
