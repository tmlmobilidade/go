/* * */

import { rawVehicleEventsNew, simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { PARSER_MAP } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { invalidateRides } from '@tmlmobilidade/go-tracker-pckg-shared';
import { Logger } from '@tmlmobilidade/logger';
import { type RawVehicleEvent, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { BatchWriter, type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: 10_000,
	insertFn: async (data) => {
		await simplifiedVehicleEventsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedVehicleEventsNew.getTableName(),
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

	const rawVehicleEventsNewCollection = await rawVehicleEventsNew.getCollection();

	await replicate<RawVehicleEvent>({

		countDestinationDbFn: async () => {
			return await simplifiedVehicleEventsNew.count(
				'*',
				'created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
		},

		countSourceDbFn: async () => {
			const result = await rawVehicleEventsNew.count(rawdbQuery);
			return result;
		},

		deleteDestinationDbFn: async (ids: string[]) => {
			await simplifiedVehicleEventsNew.delete(
				'_id IN ($1)',
				{ 1: ids.map(id => `'${id}'`).join(', ') },
			);
		},

		distinctDestinationDbFn: async () => {
			return await simplifiedVehicleEventsNew.distinct(
				'_id',
				'created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
		},

		distinctSourceDbFn: async () => {
			const result = await rawVehicleEventsNew.distinct('_id', rawdbQuery);
			return result.map(String);
		},

		missingDocumentsSourceDbAsyncIterator: (missingDocumentIds) => {
			return rawVehicleEventsNewCollection.find({ _id: { $in: missingDocumentIds } }).stream();
		},

		onCompleteCallbackFn: async () => {
			await writer.flush(invalidateRides);
		},

		writeSourceDocumentToDestinationDbFn: async (sourceDbDocument) => {
			const parser = PARSER_MAP[sourceDbDocument.version];
			const parseResult = parser(sourceDbDocument);
			if (!parseResult) return; // Skip if parsing failed
			await writer.write(parseResult, { flushCallback: invalidateRides });
		},

	});

	//
}
