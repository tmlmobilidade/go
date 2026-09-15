/* * */

import { type ChangeStreamDocument } from '@tmlmobilidade/go-clients-mongo';
import { transformPcgiVehicleEventCore } from '@tmlmobilidade/go-tracker-pckg-shared';
import { type PcgiVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Logger } from '@tmlmobilidade/logger';

import { alsaWriter, rlWriter, tstWriter, vaWriter } from '../utils/writers.js';

/* * */

/**
 * Transforms a PCGI Core Management vehicle event into RawVehicleEvents
 * and writes each one to the RawDb collection of its agency.
 * @param databaseOperation The change stream document emitted by the PCGI collection
 */
export async function processPcgiVehicleEventCore(databaseOperation: ChangeStreamDocument<PcgiVehicleEvent>) {
	//

	//
	// Validate that the operation is an insert.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error({ message: `WARNING: processPcgiVehicleEventCore with operationType != "insert": type="${databaseOperation.operationType}"` });
	}

	//
	// Extract the PCGI document from the database operation.
	// Skip the operation if it does not carry a full document.

	if (!('fullDocument' in databaseOperation) || !databaseOperation.fullDocument) return;

	//
	// Transform the document into one RawVehicleEvent per entity
	// and write each one to the collection of its agency.
	// Invalid entities are skipped by the transform.

	const parsedDocuments = transformPcgiVehicleEventCore(databaseOperation.fullDocument);

	for (const parsedDocument of parsedDocuments) {
		if (parsedDocument.agency_id === 'LA77N') await vaWriter.write(parsedDocument);
		if (parsedDocument.agency_id === 'BNA17') await rlWriter.write(parsedDocument);
		if (parsedDocument.agency_id === 'YA15B') await tstWriter.write(parsedDocument);
		if (parsedDocument.agency_id === 'A2L1N') await alsaWriter.write(parsedDocument);
	}

	//
}
