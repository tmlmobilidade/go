/* * */

import { simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { PARSER_MAP } from '@tmlmobilidade/go-tracker-pckg-parsers';
import { invalidateRides } from '@tmlmobilidade/go-tracker-pckg-shared';
import { type ChangeStreamInsertDocument } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { RawVehicleEvent, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const DEFAULT_BATCH_SIZE = 5_000;
const DEFAULT_BATCH_TIMEOUT_MS = 1_000;
const DEFAULT_IDLE_TIMEOUT_MS = 1_000;
const DEFAULT_HEARTBEAT_TIMEOUT_MS = 2_000;

const HEARTBEAT_ENDPOINTS: Record<string, string> = {
	41: 'https://status.carrismetropolitana.pt/api/push/QRSatZitiBNIhTDneykCGV0PthvQoIUf',
	42: 'https://status.carrismetropolitana.pt/api/push/uZTfvExA1yCpNZIXIzgvCmHdSquNi0lV',
	43: 'https://status.carrismetropolitana.pt/api/push/Rp7hYCJKLL8h67IP07RDAXagwO5avchc',
	44: 'https://status.carrismetropolitana.pt/api/push/Mnm5Rn3tJAXYVWb6I51eTA4xfpXJ3vqq',
};

const writer = new BatchWriter<SimplifiedVehicleEvent>({
	batch_size: DEFAULT_BATCH_SIZE,
	batch_timeout: DEFAULT_BATCH_TIMEOUT_MS,
	idle_timeout: DEFAULT_IDLE_TIMEOUT_MS,
	insertFn: async (data) => {
		await simplifiedVehicleEventsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedVehicleEventsNew.getTableName(),
});

function publishAgencyHeartbeat(agencyId: string) {
	const endpoint = HEARTBEAT_ENDPOINTS[agencyId];
	if (!endpoint) return;

	void fetch(endpoint, { signal: AbortSignal.timeout(DEFAULT_HEARTBEAT_TIMEOUT_MS) })
		.then((response) => {
			if (response.ok) return;
			Logger.error(`[clickhouse-stream] Heartbeat failed for agency_id="${agencyId}" status=${response.status}`);
		})
		.catch((error) => {
			Logger.error(`[clickhouse-stream] Heartbeat error for agency_id="${agencyId}": ${(error as Error).message}`);
		});
}

/**
 * Process the Vehicle Event database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedVehicleEvents collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the Vehicle Event document to be processed.
 * @returns A promise that resolves when the Vehicle Event document has been processed.
 */
export async function processVehicleEvent(databaseOperation: ChangeStreamInsertDocument<RawVehicleEvent>) {
	//

	//
	// Extract the full document from the database operation and transform it
	// into a simplified vehicle event document using the appropriate parser based on the version field.

	const parser = PARSER_MAP[databaseOperation.fullDocument.version];
	const newSimplifiedVehicleEventDocument = parser(databaseOperation.fullDocument);

	if (!newSimplifiedVehicleEventDocument) {
		Logger.error(`Invalid Vehicle Event document, skipping operation: ${databaseOperation.fullDocument._id}`);
		return;
	}

	//
	// Write the new vehicle event document to the SimplifiedVehicleEvents collection

	await writer.write(newSimplifiedVehicleEventDocument, { flushCallback: invalidateRides });

	//
	// Publish the heartbeats for each agency

	publishAgencyHeartbeat(newSimplifiedVehicleEventDocument.agency_id);

	//
};
