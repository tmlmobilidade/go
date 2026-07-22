/* * */

import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { setRidesAsWaiting } from '@tmlmobilidade/go-tracker-pckg-callback';
import { PARSER_MAP } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { type RawVehicleEvent, type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter, type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: 10_000,
	insertFn: async (data) => {
		await labDb.operation.vehicleEvents.insert('JSONEachRow', data);
	},
	title: await labDb.operation.vehicleEvents.getTableName(),
});

/**
 * Syncs VehicleEvents from the RAWDB database
 * to the ClickHouse database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncVehicleEvents(timeChunk: PerformInTimeChunksItem) {
	//

	const chunkStartDate = Dates
		.fromUnixTimestamp(timeChunk.start)
		.setZone('Europe/Lisbon', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixTimestamp(timeChunk.end)
		.setZone('Europe/Lisbon', 'offset_only');

	Logger.spacer(1);
	Logger.divider(`[${timeChunk.total - timeChunk.index}/${timeChunk.total}] - ${chunkEndDate.iso}[${chunkEndDate.unix_timestamp}] › ${chunkStartDate.iso}[${chunkStartDate.unix_timestamp}]`, 150);

	//
	// Prepare the RAWDB query to retrieve documents
	// for the current timestamp chunk.

	const rawdbQuery = {
		created_at: {
			$gte: chunkStartDate.unix_timestamp,
			$lte: chunkEndDate.unix_timestamp,
		},
	};

	//
	// Implement the replication process using the generic replicate function from the utils package.
	// This function will handle the logic of counting, comparing, syncing and deleting documents
	// between the source and destination databases based on the provided functions.

	const rawVehicleEventsNewCollection = await rawDb.raw.rawVehicleEvents.getCollection();

	await replicate<RawVehicleEvent>({

		countDestinationDbFn: async () => {
			return await labDb.operation.vehicleEvents.count(
				'*',
				'created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
		},

		countSourceDbFn: async () => {
			const result = await rawDb.raw.rawVehicleEvents.count(rawdbQuery);
			return result;
		},

		deleteDestinationDbFn: async (ids: string[]) => {
			await labDb.operation.vehicleEvents.delete(
				'_id IN ($1)',
				{ 1: ids.map(id => `'${id}'`).join(', ') },
			);
		},

		distinctDestinationDbFn: async () => {
			return await labDb.operation.vehicleEvents.distinct(
				'_id',
				'created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
		},

		distinctSourceDbFn: async () => {
			const result = await rawDb.raw.rawVehicleEvents.distinct('_id', rawdbQuery);
			return result.map(String);
		},

		missingDocumentsSourceDbAsyncIterator: (missingDocumentIds) => {
			return rawVehicleEventsNewCollection.find({ _id: { $in: missingDocumentIds } }).stream();
		},

		onCompleteCallbackFn: async () => {
			await writer.flush(setRidesAsWaiting);
		},

		writeSourceDocumentToDestinationDbFn: async (sourceDbDocument) => {
			try {
				const parser = PARSER_MAP[sourceDbDocument.version];
				if (!parser) throw new Error(`No parser found for version ${sourceDbDocument.version}. Skipping document with _id "${sourceDbDocument._id}"...`);
				const parseResult = parser(sourceDbDocument);
				if (!parseResult) throw new Error(`Failed to parse document with _id "${sourceDbDocument._id}". Skipping...`);
				await writer.write(parseResult, { flushCallback: setRidesAsWaiting });
			} catch (error) {
				Logger.error({ error, message: `Parsing failed: _id="${sourceDbDocument._id}" version="${sourceDbDocument.version}"` });
			}
		},

	});

	//
}
