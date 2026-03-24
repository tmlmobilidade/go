/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { pcgidbLegacy } from '@tmlmobilidade/go-tracker-pckg-databases';
import { transformPcgiVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-shared';
import { Logger } from '@tmlmobilidade/logger';
import { type RawVehicleEvent } from '@tmlmobilidade/types';
import { type PerformInTimeChunksItem } from '@tmlmobilidade/utils';
import { BatchWriter } from '@tmlmobilidade/writers';

/* * */

const writer = new BatchWriter<RawVehicleEvent>({
	batch_size: 100_000,
	insertFn: async (data) => {
		await rawVehicleEventsNew.insertOne(data);
	},
	title: await rawVehicleEventsNew.getCollectionName(),
});

/**
 * Syncs Vehicle Events from the Legacy PCGI database
 * to the MongoDB database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncPcgidbCoreVehicleEvents(timeChunk: PerformInTimeChunksItem) {
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
	// Prepare the queries to compare documents from each database
	// in the current timestamp chunk.

	const pcgidbLegacyCoreQuery = {
		millis: {
			$gte: chunkStartDate.unix_timestamp,
			$lte: chunkEndDate.unix_timestamp,
		},
	};

	//
	// Sync all documents in the current timestamp chunk. We query the Source database for all documents
	// in the current timestamp chunk, parse them and write them to the Destination database.
	// This is done in batches, so that we don't overload the memory. The IDs are not checked on purpose
	// because they are impossible to calculate without fetching and parsing all documents,
	// so we just upsert them in the Destination database and the DB takes care of deduplication.

	const pcgidbLegacyCoreStream = pcgidbLegacy.VehicleEventsCore.find(pcgidbLegacyCoreQuery).stream();

	for await (const document of pcgidbLegacyCoreStream) {
		const parsedDocuments = transformPcgiVehicleEvent(document);
		for (const parsedDocument of parsedDocuments) {
			await writer.write(parsedDocument);
		}
	}

	await writer.flush();

	//
};
