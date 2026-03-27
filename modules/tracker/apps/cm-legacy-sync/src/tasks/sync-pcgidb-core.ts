/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { pcgidbLegacy } from '@tmlmobilidade/go-tracker-pckg-databases';
import { transformPcgiVehicleEventCore } from '@tmlmobilidade/go-tracker-pckg-shared';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
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
	title: 'CORE',
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
	Logger.divider(`CORE [${timeChunk.total - timeChunk.index}/${timeChunk.total}] - ${chunkEndDate.iso}[${chunkEndDate.unix_timestamp}] › ${chunkStartDate.iso}[${chunkStartDate.unix_timestamp}]`, 150);

	//
	// Implement a simplified version of the replication process, since there is no possibility
	// of comparing documents by ID. Only check the count of documents in each database for the
	// current timestamp chunk, and if they are different, sync all of them.

	const countStepTimer = new Timer();

	const sourceQuery = {
		millis: {
			$gte: chunkStartDate.unix_timestamp,
			$lte: chunkEndDate.unix_timestamp,
		},
	};

	const sourceDbCount = await pcgidbLegacy.VehicleEventsCore.countDocuments(sourceQuery);

	const destinationDbCount = await rawVehicleEventsNew.count({
		received_at: {
			$gte: chunkStartDate.unix_timestamp,
			$lte: chunkEndDate.unix_timestamp,
		},
		version: 'cmet-v1-core',
	});

	if (sourceDbCount === destinationDbCount) {
		Logger.success(`[CORE] MATCH: Found the same number of documents in both databases: ${sourceDbCount} Source = ${destinationDbCount} Destination (${countStepTimer.get()})`);
		return;
	}

	Logger.info(`[CORE] MISMATCH: Document count was different for both databases: ${sourceDbCount} Source != ${destinationDbCount} Destination (${countStepTimer.get()})`);

	//
	// Sync all documents in the current timestamp chunk. We query the Source database for all documents
	// in the current timestamp chunk, parse them and write them to the Destination database.
	// This is done in batches, so that we don't overload the memory. The IDs are not checked on purpose
	// because they are impossible to calculate without fetching and parsing all documents,
	// so we just upsert them in the Destination database and the DB takes care of deduplication.

	const pcgidbLegacyCoreStream = pcgidbLegacy.VehicleEventsCore.find(sourceQuery).stream();

	for await (const document of pcgidbLegacyCoreStream) {
		const parsedDocuments = transformPcgiVehicleEventCore(document);
		for (const parsedDocument of parsedDocuments) {
			await writer.write(parsedDocument);
		}
	}

	await writer.flush();

	//
};
