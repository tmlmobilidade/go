/* eslint-disable @typescript-eslint/no-explicit-any */

/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type MongoDbWriter, type MongoDBWriterWriteOps } from '@tmlmobilidade/writers';

/* * */

interface SyncDocumentsOptions<T> {
	dbWriter: MongoDbWriter<T>
	docParser: (pcgiDoc: any) => T
	flushCallback: (data?: MongoDBWriterWriteOps<T>[]) => Promise<void>
	goCollection: any
	goIdKey: string
	goQuery: any
	pcgiCollection: any
	pcgiIdKey: string
	pcgiQuery: any
}

/* * */

export async function syncDocuments<T>({ dbWriter, docParser, flushCallback, goCollection, goIdKey, goQuery, pcgiCollection, pcgiIdKey, pcgiQuery }: SyncDocumentsOptions<T>) {
	try {
		//

		const globalTimer = new Timer();

		//
		// Count how many documents are matched in each database
		// for the given queries. If the document count is the same for both databases,
		// then we assume all documents are synced, and we can skip the rest of the process.

		const countQueryTimer = new Timer();

		const pcgiDocCount = await pcgiCollection.countDocuments(pcgiQuery);
		const goDocCount = await goCollection.countDocuments(goQuery);

		if (pcgiDocCount === goDocCount) {
			Logger.success(`MATCH: Found the same number of documents in both databases: ${pcgiDocCount} PCGIDB = ${goDocCount} GO (${countQueryTimer.get()})`);
			return;
		}

		Logger.info(`MISMATCH: Document count was different for both databases: ${pcgiDocCount} PCGIDB != ${goDocCount} GO (${countQueryTimer.get()})`);

		//
		// If the document count was different, then we check which documents are missing.
		// Instead of syncing all documents again, we check only the missing IDs. This is done
		// by getting the distinct IDs from each database and comparing them to find the missing ones.

		const distinctQueryTimer = new Timer();

		const pcgiDocIds = await pcgiCollection.distinct(pcgiIdKey, pcgiQuery);
		const pcgiDocIdsUnique = new Set(pcgiDocIds.map(String));

		const goDocIds = await goCollection.distinct(goIdKey, goQuery);
		const goDocIdsUnique = new Set(goDocIds.map(String));

		const missingDocuments = pcgiDocIds.filter((documentId: string) => !goDocIdsUnique.has(String(documentId)));
		const extraDocuments = goDocIds.filter((documentId: string) => !pcgiDocIdsUnique.has(String(documentId)));

		Logger.info(`PCGI Total: ${pcgiDocCount} | PCGI Unique: ${pcgiDocIdsUnique.size} | PCGI ▲: ${pcgiDocCount - pcgiDocIdsUnique.size} | GO Total: ${goDocCount} | GO Unique: ${goDocIdsUnique.size} | GO ▲: ${goDocCount - goDocIdsUnique.size} | GO Missing: ${missingDocuments.length} | GO Extra: ${extraDocuments.length} (${distinctQueryTimer.get()})`);

		//
		// If all documents are already synced, then we can skip the rest of the process.

		if (missingDocuments.length === 0) {
			Logger.success(`Chunk complete. All document IDs matched. (${distinctQueryTimer.get()})`);
		}

		//
		// If there are extra documents in the GO database, then we remove them.

		if (extraDocuments.length > 0) {
			await goCollection.deleteMany({ [goIdKey]: { $in: extraDocuments }, ...goQuery });
			Logger.info(`Removed ${extraDocuments.length} extra documents in GO. (${distinctQueryTimer.get()})`);
		}

		//
		// If there are missing documents, then we sync them.
		// We query the PCGIDB for the missing documents and write them to the GO database.

		Logger.info(`Found ${missingDocuments.length} missing documents in GO. (${distinctQueryTimer.get()})`);

		const missingDocumentsStream = pcgiCollection
			.find({ [pcgiIdKey]: { $in: missingDocuments } })
			.stream();

		for await (const pcgiDocument of missingDocumentsStream) {
			const parsedSlaDoc = docParser(pcgiDocument);
			if (!parsedSlaDoc) continue; // Skip if parsing failed
			await dbWriter.write(parsedSlaDoc, { filter: { [goIdKey]: parsedSlaDoc[goIdKey] }, upsert: true }, async () => { /**/ }, flushCallback);
		}

		//
		// Flush the remaining documents in the writer to the database
		// and complete the sync process.

		await dbWriter.flush(flushCallback);

		Logger.success(`Complete! Synced ${missingDocuments.length} new documents. (${globalTimer.get()})`);

		//
	}
	catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}

	//
};
