/* * */

import { getCoreMigrateCoordinatorUrl } from '@tmlmobilidade/go-tracker-pckg-shared';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { migrateCoreVehicleEvents } from './tasks/migrate-core-vehicle-events.js';

/* * */

const PROCESS_ID = `${process.pid}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'pt-tml-cm-core-migrate', message: 'Sentry Tracker CM Core Migrate initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker CM Core Migrate' });
}

async function main() {
	//

	Logger.info({ message: `[${PROCESS_ID}] Starting...` });

	const globalTimer = new Timer();

	//
	// Ask the coordinator for a batch of Core Vehicle Events to process

	const fetchCoordinatorTimer = new Timer();

	const coordinatorUrl = getCoreMigrateCoordinatorUrl('core-vehicle-events');

	Logger.info({ message: `[${PROCESS_ID}] Fetching core vehicle events session ID from coordinator: ${coordinatorUrl}/${PROCESS_ID}` });

	const coreVehicleEventsSessionId = await fetch(`${coordinatorUrl}/${PROCESS_ID}`)
		.then(response => response.text())
		.catch((error) => {
			Logger.error({ error, message: `[${PROCESS_ID}] Failed to fetch core vehicle events session ID from coordinator: ${error}` });
			return null;
		});

	if (!coreVehicleEventsSessionId) {
		Logger.error({ message: `[${PROCESS_ID}] No core vehicle events session ID received.` });
		return;
	}

	Logger.info({ message: `[${PROCESS_ID}] Fetched core vehicle events session ID from coordinator: ${coreVehicleEventsSessionId} (fetch: ${fetchCoordinatorTimer.get()})` });

	//
	// Migrate every document the coordinator assigned to this session

	const insertedCount = await migrateCoreVehicleEvents({ processId: PROCESS_ID, sessionId: coreVehicleEventsSessionId });

	Logger.terminate(`[${PROCESS_ID}] => Run took ${globalTimer.get()}. Migrated ${insertedCount} documents.`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '1s', throwOnError: true });
