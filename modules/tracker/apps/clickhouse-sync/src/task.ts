/* * */

import { Dates } from '@tmlmobilidade/dates';
import { invalidateRides, PARSER_MAP, TrackerVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-common';
import { rawdbVehicleEvents } from '@tmlmobilidade/go-tracker-pckg-databases';
import { simplifiedVehicleEventsNew } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/utils';
import { BatchWriter } from '@tmlmobilidade/writers';

/* * */

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: 50_000,
	insertFn: async (data) => {
		await simplifiedVehicleEventsNew.insert('JSONEachRow', data);
	},
	title: simplifiedVehicleEventsNew.tableName,
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

	await replicate<TrackerVehicleEvent>({

		countDestinationDbFn: async () => {
			const result = await simplifiedVehicleEventsNew.queryFromString<{ count: number }>(
				'SELECT COUNT(*) as count FROM "operation"."simplified_vehicle_events" WHERE created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
			return result[0].count;
		},

		countSourceDbFn: async () => {
			const result = await rawdbVehicleEvents.RawVehicleEvents.countDocuments(rawdbQuery);
			return result;
		},

		deleteDestinationDbFn: async (ids: string[]) => {
			await simplifiedVehicleEventsNew.queryFromString(
				'DELETE FROM "operation"."simplified_vehicle_events" WHERE _id IN ($1)',
				{ 1: ids.map(id => `'${id}'`).join(', ') },
			);
		},

		distinctDestinationDbFn: async () => {
			const result = await simplifiedVehicleEventsNew.queryFromString<{ _id: string }>(
				'SELECT _id FROM "operation"."simplified_vehicle_events" WHERE created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
			return result.map(doc => doc._id);
		},

		distinctSourceDbFn: async () => {
			const result = await rawdbVehicleEvents.RawVehicleEvents.distinct('_id', rawdbQuery);
			return result.map(String);
		},

		missingDocumentsSourceDbAsyncIterator: (missingDocumentIds) => {
			return rawdbVehicleEvents.RawVehicleEvents
				.find({ _id: { $in: missingDocumentIds } })
				.stream();
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
