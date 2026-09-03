/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { cleanStuckPlans } from './tasks/clean-stuck-plans.js';
import { cleanupCompleteEventRideOpportunities } from './tasks/cleanup-complete-event-ride-opportunities.js';
import { cleanupOrphanRides } from './tasks/cleanup-orphan-rides.js';

/* * */

async function reprocessStuckRides() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'rides-cleaner', message: 'Sentry Rides Cleaner initialized', module: 'controller', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Rides Cleaner' });
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run cleanup tasks

	// await cleanStuckRides();

	await cleanupOrphanRides();
	await cleanupCompleteEventRideOpportunities();
	// await cleanupOrphanHashedTrips();
	// await cleanupOrphanHashedShapes();

	await cleanStuckPlans();

	Logger.terminate(`Run took ${globalTimer.get()}.`);

	//
};

/* * */

await runOnInterval(reprocessStuckRides, { intervalMs: '10s' });
