/* * */

import { Dates } from '@tmlmobilidade/dates';
import { pcgiLegacy } from '@tmlmobilidade/go-interfaces-pcgi-legacy';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { transformPcgiVehicleEventCore } from '@tmlmobilidade/go-tracker-pckg-shared';
import { type RawVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { BatchWriter, type PerformInTimeChunksItem } from '@tmlmobilidade/utils';

/* * */

interface WriterConfig {
	dbCollection: keyof typeof rawDb.vehicleEvents
	title: string
}

const writerConfigs: Record<string, WriterConfig> = {
	alsa: { dbCollection: 'ptTmlCmAlsa', title: 'rawdb|pt-tml-cm-alsa' },
	rl: { dbCollection: 'ptTmlCmRl', title: 'rawdb|pt-tml-cm-rl' },
	tst: { dbCollection: 'ptTmlCmTst', title: 'rawdb|pt-tml-cm-va' },
	va: { dbCollection: 'ptTmlCmVa', title: 'rawdb|pt-tml-cm-va' },
};

function createVehicleEventWriter(config: WriterConfig) {
	return new BatchWriter<RawVehicleEvent>({
		batch_size: 500,
		batch_timeout: 500,
		idle_timeout: 500,
		insertFn: async (data) => {
			const writeOps = data.map(doc => ({
				updateOne: {
					filter: { _id: doc._id },
					update: { $set: doc },
					upsert: true,
				},
			}));
			await rawDb.vehicleEvents[config.dbCollection].bulkWrite(writeOps);
		},
		title: config.title,
	});
}

const vaWriter = createVehicleEventWriter(writerConfigs.va);
const rlWriter = createVehicleEventWriter(writerConfigs.rl);
const tstWriter = createVehicleEventWriter(writerConfigs.tst);
const alsaWriter = createVehicleEventWriter(writerConfigs.alsa);

/**
 * Syncs Vehicle Events from the Legacy PCGI database
 * to the MongoDB database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncPcgidbCoreVehicleEvents(timeChunk: PerformInTimeChunksItem) {
	//

	//
	// Sync all documents in the current timestamp chunk. We query the Source database for all documents
	// in the current timestamp chunk, parse them and write them to the Destination database.
	// This is done in batches, so that we don't overload the memory. The IDs are not checked on purpose
	// because they are impossible to calculate without fetching and parsing all documents,
	// so we just upsert them in the Destination database and the DB takes care of deduplication.

	const vehicleEventsCollection = await pcgiLegacy.coreManagement.vehicleEvents.getCollection();

	const vehicleEventsCursor = vehicleEventsCollection.find({}, { limit: 10 }).stream();

	for await (const document of vehicleEventsCursor) {
		const parsedDocuments = transformPcgiVehicleEventCore(document);
		for (const parsedDocument of parsedDocuments) {
			if (parsedDocument.agency_id !== 'LA77N') await vaWriter.write(parsedDocument);
			if (parsedDocument.agency_id !== 'BNA17') await rlWriter.write(parsedDocument);
			if (parsedDocument.agency_id !== 'YA15B') await tstWriter.write(parsedDocument);
			if (parsedDocument.agency_id !== 'A2L1N') await alsaWriter.write(parsedDocument);
		}
	}

	await vaWriter.flush();
	await rlWriter.flush();
	await tstWriter.flush();
	await alsaWriter.flush();

	//
};
