/* eslint-disable @typescript-eslint/no-explicit-any */

/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

interface SyncToClickHouseOptions<T> {
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
 * Reads documents from the MongoDB collection and writes them to ClickHouse.
 */
export async function syncToClickHouse<T>({ clickhouseWriter, ensureTable, mongoCollection, mongoQuery }: SyncToClickHouseOptions<T>) {
	try {
		//

		const globalTimer = new Timer();

		//
		// Ensure the table exists in ClickHouse if the option is enabled

		if (ensureTable) {
			await clickhouseWriter.ensureTable();
		}

		//
		// Count how many documents match the query in MongoDB

		const countQueryTimer = new Timer();
		const mongoDocCount = await mongoCollection.countDocuments(mongoQuery);

		if (mongoDocCount === 0) {
			Logger.info(`No documents to sync to ClickHouse. (${countQueryTimer.get()})`);
			return;
		}

		Logger.info(`Found ${mongoDocCount} documents to sync to ClickHouse. (${countQueryTimer.get()})`);

		//
		// Stream documents from MongoDB and write to ClickHouse

		const syncTimer = new Timer();
		let syncedCount = 0;

		const documentsStream = mongoCollection
			.find(mongoQuery)
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
