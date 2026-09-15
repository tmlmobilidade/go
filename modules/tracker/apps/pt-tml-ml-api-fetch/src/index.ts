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
	Logger.startNodeLogs({ app: 'pt-tml-ml-api-fetch', message: 'Sentry Tracker Metro Lisboa Fetch initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker Metro Lisboa Fetch' });
}

async function main() {
	//

	const timer = new Timer();

	//
	// Fetch the Metro Lisboa Vehicle Events from the API
	// and save the new ones to the RawVehicleEvents collection

	const saveCount = await fetchVehicleEvents(ITERATION);

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from Metro Lisboa data in ${timer.get()}.` });

	ITERATION++;

	//
}

/* * */

await runOnInterval(main, { intervalMs: '5s', throwOnError: true });
