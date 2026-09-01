/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { cleanStuckRides } from './tasks/clean-stuck-rides.js';
import { cleanupOrphanHashedShapes } from './tasks/cleanup-orphan-hashed-shapes.js';
import { cleanupOrphanHashedTrips } from './tasks/cleanup-orphan-hashed-trips.js';
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

	await cleanStuckRides();
	await cleanupOrphanRides();
	await cleanupOrphanHashedTrips();
	await cleanupOrphanHashedShapes();

	Logger.terminate(`Run took ${globalTimer.get()}.`);

	//
};

/* * */

await runOnInterval(reprocessStuckRides, { intervalMs: '10s' });
