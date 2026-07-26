/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { transformPcgiVehicleEventCore } from '@tmlmobilidade/go-tracker-pckg-shared';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'pt-tml-cm-core-sync', message: 'Sentry Tracker CM Sync Core initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker CM Sync Core' });
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Get the earliest date from which we have data to sync,
	// and perform the sync in time chunks until we reach the current date.

	const earliestDate = getEarliestDate();

	//
	// Sync all documents in the current timestamp chunk. We query the Source database for all documents
	// in the current timestamp chunk, parse them and write them to the Destination database.
	// This is done in batches, so that we don't overload the memory. The IDs are not checked on purpose
	// because they are impossible to calculate without fetching and parsing all documents,
	// so we just upsert them in the Destination database and the DB takes care of deduplication.

	const vehicleEventsCollection = await rawDb.coreManagementCopy.vehicleEvents.getCollection();

	const vehicleEventsCursor = vehicleEventsCollection.find({}, { limit: 100_000 }).stream();

	let insertedCount = 0;

	for await (const document of vehicleEventsCursor) {
		const currentInsertedDocumentIds: string[] = [];
		try {
			Logger.progress({ message: `Migrating "${document._id}"...` });
			// Transform the document
			const parsedDocuments = transformPcgiVehicleEventCore(document);
			// Write the documents to the destination databases
			for (const parsedDocument of parsedDocuments) {
				// Skip if document has no trip_id
				if (!parsedDocument.payload.vehicle?.trip?.tripId) continue;
				// If the document created_at is before the earliest date, skip it
				if (parsedDocument.created_at < earliestDate.unix_timestamp) continue;
				// Write the document to the correct collection
				if (parsedDocument.agency_id === 'LA77N') {
					await rawDb.vehicleEvents.ptTmlCmVa.insertOne(parsedDocument);
					currentInsertedDocumentIds.push(parsedDocument._id);
					insertedCount++;
				}
				if (parsedDocument.agency_id === 'BNA17') {
					await rawDb.vehicleEvents.ptTmlCmRl.insertOne(parsedDocument);
					currentInsertedDocumentIds.push(parsedDocument._id);
					insertedCount++;
				}
				if (parsedDocument.agency_id === 'YA15B') {
					await rawDb.vehicleEvents.ptTmlCmTst.insertOne(parsedDocument);
					currentInsertedDocumentIds.push(parsedDocument._id);
					insertedCount++;
				}
				if (parsedDocument.agency_id === 'A2L1N') {
					await rawDb.vehicleEvents.ptTmlCmAlsa.insertOne(parsedDocument);
					currentInsertedDocumentIds.push(parsedDocument._id);
					insertedCount++;
				}
			}
			// Delete the document from the source database
			// await vehicleEventsCollection.deleteOne({ _id: document._id });
			Logger.success(`PCGI ID "${document._id}" -> [${parsedDocuments.map(doc => doc.agency_id).join('|')}] (x${currentInsertedDocumentIds.length}) [ ${currentInsertedDocumentIds.join(' | ')} ]`, 1);
		} catch (error) {
			Logger.error({ error, message: `Failed to migrate document "${document._id}": ${error.message}` });
		}
	}

	Logger.terminate(`Run took ${globalTimer.get()}. Migrated ${insertedCount} documents.`);
}

/* * */

await runOnInterval(main, { intervalMs: '5s', throwOnError: false });
