/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { transformPcgiVehicleEventCore } from '@tmlmobilidade/go-tracker-pckg-shared';
import { Logger } from '@tmlmobilidade/logger';
import { ObjectId } from 'mongodb';

/* * */

interface MigrateCoreVehicleEventsParams {
	processId: string
	sessionId: string
}

/**
 * Migrates the PCGI Core Management vehicle events assigned to the given session
 * into the RawVehicleEvents collections, deleting each source document once written.
 * IDs are not checked on purpose because they are impossible to calculate without
 * fetching and parsing all documents, so documents are upserted and the database
 * takes care of deduplication.
 * @param params The process ID (for log tagging) and the coordinator session ID
 * @returns The number of RawVehicleEvents inserted
 */
export async function migrateCoreVehicleEvents({ processId, sessionId }: MigrateCoreVehicleEventsParams): Promise<number> {
	//

	//
	// Get the earliest date from which we keep data

	const earliestDate = getEarliestDate();

	//
	// Stream all documents assigned to this session,
	// most recent first, so that we don't overload the memory.

	const vehicleEventsCollection = await rawDb.coreManagementCopy.vehicleEvents.getCollection();

	const vehicleEventsCursor = vehicleEventsCollection
		.find({ status: sessionId }, { sort: { millis: -1 } })
		.stream();

	let insertedCount = 0;

	for await (const document of vehicleEventsCursor) {
		try {
			//

			//
			// Transform the document into one RawVehicleEvent per entity
			// and write each one to the collection of its agency

			const parsedDocuments = transformPcgiVehicleEventCore(document);

			for (const parsedDocument of parsedDocuments) {
				// Skip if document has no trip_id
				if (!parsedDocument.payload.vehicle?.trip?.tripId) continue;
				// If the document created_at is before the earliest date, skip it
				if (parsedDocument.created_at < earliestDate.unix_milliseconds) continue;
				// Write the document to the correct collection
				if (parsedDocument.agency_id === 'LA77N') {
					await rawDb.vehicleEvents.ptTmlCmVa.insertOne(parsedDocument);
					insertedCount++;
				}
				if (parsedDocument.agency_id === 'BNA17') {
					await rawDb.vehicleEvents.ptTmlCmRl.insertOne(parsedDocument);
					insertedCount++;
				}
				if (parsedDocument.agency_id === 'YA15B') {
					await rawDb.vehicleEvents.ptTmlCmTst.insertOne(parsedDocument);
					insertedCount++;
				}
				if (parsedDocument.agency_id === 'A2L1N') {
					await rawDb.vehicleEvents.ptTmlCmAlsa.insertOne(parsedDocument);
					insertedCount++;
				}
			}

			//
			// Delete the document from the source database

			await vehicleEventsCollection.deleteOne({ _id: new ObjectId(document._id) as unknown as string });

			//
		} catch (error) {
			if (error.message.startsWith('E11000')) {
				const deleteResult = await vehicleEventsCollection.deleteOne({ _id: new ObjectId(document._id) as unknown as string });
				Logger.error({ message: `[${processId}] Deleted duplicate document "${document._id}" from source database (deleted: ${deleteResult.deletedCount})` });
			} else {
				Logger.error({ error, message: `[${processId}] !-> Failed to migrate document "${document._id}": ${error.message}` });
			}
		}
	}

	return insertedCount;

	//
}
