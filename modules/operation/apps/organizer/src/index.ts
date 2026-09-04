/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { normalizePlansTask } from './tasks/plans/normalize-plans/normalize-plans.js';

/* * */

async function reprocessStuckRides() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'organizer', message: 'Sentry Organizer initialized', module: 'operation', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Organizer' });
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	/* * */
	/* GTFS VALIDATIONS */

	// await removeOldGtfsValidationsTask();

	/* * */
	/* PLANS */

	await normalizePlansTask();

	/* * */
	/* RIDES */

	// await releaseStuckPlansTask();
	// await releaseStuckRidesTask();
	// await removeOrphanRidesTask();
	// await cleanupOrphanHashedTrips();
	// await cleanupOrphanHashedShapes();

	/* * */

	Logger.terminate(`Run took ${globalTimer.get()}.`);

	//
};

/* * */

await runOnInterval(reprocessStuckRides, { intervalMs: '10s' });
