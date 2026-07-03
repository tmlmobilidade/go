/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { pcgidbLegacy } from '@tmlmobilidade/go-tracker-pckg-databases';
import { transformPcgiVehicleEventLog } from '@tmlmobilidade/go-tracker-pckg-shared';
import { Logger } from '@tmlmobilidade/logger';
import { type RawVehicleEvent } from '@tmlmobilidade/types';
import { BatchWriter, type PerformInTimeChunksItem } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<RawVehicleEvent>({
	batch_size: 10_000,
	insertFn: async (data) => {
		const writeOps = data.map(doc => ({
			updateOne: {
				filter: { _id: doc._id },
				update: { $set: doc },
				upsert: true,
			},
		}));
		await rawVehicleEventsNew.bulkWrite(writeOps);
	},
	title: 'LOG',
});

/**
 * Syncs Vehicle Events from the Legacy PCGI database
 * to the MongoDB database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncPcgidbLogVehicleEvents(timeChunk: PerformInTimeChunksItem) {
	//

	const chunkStartDate = Dates
		.fromUnixTimestamp(timeChunk.start)
		.setZone('Europe/Lisbon', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixTimestamp(timeChunk.end)
		.setZone('Europe/Lisbon', 'offset_only');

	Logger.spacer(1);
	Logger.divider(`LOG [${timeChunk.total - timeChunk.index}/${timeChunk.total}] - ${chunkEndDate.iso}[${chunkEndDate.unix_timestamp}] › ${chunkStartDate.iso}[${chunkStartDate.unix_timestamp}]`, 150);

	//
	// Sync all documents in the current timestamp chunk. We query the Source database for all documents
	// in the current timestamp chunk, parse them and write them to the Destination database.
	// This is done in batches, so that we don't overload the memory. The IDs are not checked on purpose
	// because they are impossible to calculate without fetching and parsing all documents,
	// so we just upsert them in the Destination database and the DB takes care of deduplication.

	const pcgidbLegacyLogStream = pcgidbLegacy
		.VehicleEventsLog
		.find({
			millis: {
				$gte: chunkStartDate.unix_timestamp,
				$lte: chunkEndDate.unix_timestamp,
			},
		})
		.stream();

	for await (const document of pcgidbLegacyLogStream) {
		const parsedDocuments = transformPcgiVehicleEventLog(document);
		for (const parsedDocument of parsedDocuments) {
			await writer.write(parsedDocument);
		}
	}

	await writer.flush();

	//
};
