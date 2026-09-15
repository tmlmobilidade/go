/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { fetchVehicleEvents } from './tasks/fetch-vehicle-events.js';

/* * */

let ITERATION = 0;

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'pt-tml-mobi-api-fetch', message: 'Sentry Tracker MOBI Fetch initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker MOBI Fetch' });
}

async function main() {
	//

	const timer = new Timer();

	//
	// Fetch the MOBI Vehicle Events from the API
	// and save the new ones to the RawVehicleEvents collection

	const saveCount = await fetchVehicleEvents(ITERATION);

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from MOBI data in ${timer.get()}.` });

	ITERATION++;

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s', throwOnError: true });
