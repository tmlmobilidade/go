/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { transformPcgiVehicleEventCore } from '@tmlmobilidade/go-tracker-pckg-shared';
import { type RawVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { BatchWriter } from '@tmlmobilidade/utils';

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

/* * */

export async function processPcgiVehicleEventCore(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error({ message: `WARNING: processApexLocation with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"` });
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const parsedDocuments = transformPcgiVehicleEventCore(databaseOperation.fullDocument);

	for (const parsedDocument of parsedDocuments) {
		if (parsedDocument.agency_id !== 'LA77N') await vaWriter.write(parsedDocument);
		if (parsedDocument.agency_id !== 'BNA17') await rlWriter.write(parsedDocument);
		if (parsedDocument.agency_id !== 'YA15B') await tstWriter.write(parsedDocument);
		if (parsedDocument.agency_id !== 'A2L1N') await alsaWriter.write(parsedDocument);
	}

	//
};
