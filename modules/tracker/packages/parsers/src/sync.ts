/* * */

import { type Collection, type Filter } from '@tmlmobilidade/go-clients-mongo';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type MongoInterfaceTemplate, rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { BatchWriter, performInChunks, type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { ZodError } from 'zod';

import { PARSER_MAP } from './parsers.js';

/**
 * Valid `agency_id` <-> `rawDb.collection` pairs for vehicle-events sync.
 * Specifying either field narrows the other to the only matching value.
 */
type SyncConfig = {
	[K in keyof typeof rawDb.vehicleEvents]: {
		agency_id: VehicleEventsCollectionDocument<typeof rawDb.vehicleEvents[K]>['agency_id']
		collection: typeof rawDb.vehicleEvents[K]
	}
}[keyof typeof rawDb.vehicleEvents];

/**
 * Parameters for the handleSyncRawVehicleEventsIntoSimplifiedVehicleEvents function.
 */
export interface HandleSyncRawVehicleEventIntoSimplifiedVehicleEventParams {

	/**
	 * The batch writer to be used to write the SimplifiedVehicleEvent
	 * documents to the SimplifiedVehicleEvents collection.
	 */
	batchWriter: BatchWriter<SimplifiedVehicleEvent>

	/**
	 * The configuration item for the sync operation.
	 */
	configItem: SyncConfig

	/**
	 * The callback to be called when the batch writer is flushed.
	 */
	flushCallback: (data: SimplifiedVehicleEvent[]) => Promise<void>

	/**
	 * The time chunk to sync the data for.
	 */
	timeChunk: PerformInTimeChunksItem
}

/**
 * Document type accepted by a given
 * `rawDb.vehicleEvents` collection.
 */
type VehicleEventsCollectionDocument<C> = C extends MongoInterfaceTemplate<infer T, unknown> ? T : never;

/**
 * Parse the RawVehicleEvent document into a SimplifiedVehicleEvent document
 * by validating the operation type, transforming the document, and writing it
 * to the SimplifiedVehicleEvents collection.
 * @param params The parameters for the function.
 * @returns A promise that resolves when the RawVehicleEvent document has been
 * parsed into a SimplifiedVehicleEvent document.
 */
export async function handleSyncRawVehicleEventsIntoSimplifiedVehicleEvents({ batchWriter, configItem, flushCallback, timeChunk }: HandleSyncRawVehicleEventIntoSimplifiedVehicleEventParams) {
	//

	const chunkStartDate = Dates
		.fromUnixMilliseconds(timeChunk.start)
		.setZone('Europe/Lisbon', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixMilliseconds(timeChunk.end)
		.setZone('Europe/Lisbon', 'offset_only');

	Logger.spacer(1);
	Logger.divider(`[${timeChunk.total - timeChunk.index}/${timeChunk.total}] ${configItem.agency_id} - ${chunkEndDate.iso}[${timeChunk.end}] › ${chunkStartDate.iso}[${timeChunk.start}]`, 150);

	//
	// Prepare the PCGIDB query to retrieve documents
	// for the current timestamp chunk.

	const rawdbQuery: Filter<VehicleEventsCollectionDocument<SyncConfig['collection']>> = {
		created_at: {
			$gte: timeChunk.start,
			$lt: timeChunk.end,
		},
	};

	//
	// Implement the replication process using the generic replicate function from the utils package.
	// This function will handle the logic of counting, comparing, syncing and deleting documents
	// between the source and destination databases based on the provided functions.

	// `getCollection()` on a SyncConfig union yields `Collection<A> | Collection<B> | …`,
	// which rejects `Filter<A | B>`. Collapse to `Collection<A | B>` so the filter type-checks.
	const rawdbCollection = await configItem.collection.getCollection() as Collection<VehicleEventsCollectionDocument<SyncConfig['collection']>>;

	await replicate<VehicleEventsCollectionDocument<SyncConfig['collection']>>({

		countDestinationDbFn: async () => {
			return await labDb.operation.simplifiedVehicleEvents.count(
				'*',
				'created_at >= $1 AND created_at < $2 AND agency_id = $3',
				{ 1: timeChunk.start, 2: timeChunk.end, 3: configItem.agency_id },
			);
		},

		countSourceDbFn: async () => {
			const result = await rawdbCollection.countDocuments(rawdbQuery);
			return result;
		},

		deleteDestinationDbFn: async (ids: string[]) => {
			await performInChunks(ids, async (chunk) => {
				const deleteTimer = new Timer();
				const labDbClient = await labDb.getClient();
				await labDbClient.command({
					query: `
					ALTER TABLE operation.simplified_vehicle_events
					DELETE WHERE _id IN (${chunk.map(id => `'${id}'`).join(',')})
				`,
				});
				Logger.info({ message: `Deleted ${chunk.length} documents from the destination database in ${deleteTimer.get()}.` });
			}, 500);
			await new Promise(resolve => setTimeout(resolve, 10_000));
		},

		distinctDestinationDbFn: async () => {
			return await labDb.operation.simplifiedVehicleEvents.distinct(
				'_id',
				'created_at >= $1 AND created_at < $2 AND agency_id = $3',
				{ 1: timeChunk.start, 2: timeChunk.end, 3: configItem.agency_id },
			);
		},

		distinctSourceDbFn: async () => {
			return await rawdbCollection.distinct('_id', rawdbQuery);
		},

		missingDocumentsSourceDbAsyncIterator: (missingDocumentIds) => {
			return rawdbCollection
				.find({ _id: { $in: missingDocumentIds } })
				.stream();
		},

		onCompleteCallbackFn: async () => {
			await batchWriter.flush(flushCallback);
		},

		writeSourceDocumentToDestinationDbFn: async (sourceDbDocument) => {
			try {
				// Get the parser for the vehicle event version
				const parser = PARSER_MAP[sourceDbDocument.version];
				if (!parser) throw new Error(`No parser found for version ${sourceDbDocument.version}. Skipping document with _id "${sourceDbDocument._id}"...`);
				// Parse the vehicle event into a simplified vehicle event
				const newSimplifiedVehicleEventDocument = await parser(sourceDbDocument);
				if (!newSimplifiedVehicleEventDocument) throw new Error(`Failed to parse document with _id "${sourceDbDocument._id}". Skipping...`);
				// Write the simplified vehicle event document to the destination database
				await batchWriter.write(newSimplifiedVehicleEventDocument, { flushCallback });
			} catch (error) {
				const errorMessage = error instanceof ZodError
					? error.issues.map(issue => `${issue.path.join('.')} ${issue.message}`).join('; ')
					: error instanceof Error ? error.message : String(error);
				Logger.info({ message: `=> Error transforming RawVehicleEvent document: [${sourceDbDocument.agency_id}] ${sourceDbDocument._id} Reason: ${errorMessage}` });
			}
		},

	});
};
