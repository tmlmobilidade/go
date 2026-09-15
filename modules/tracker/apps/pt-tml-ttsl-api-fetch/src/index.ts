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
	Logger.startNodeLogs({ app: 'pt-tml-ttsl-api-fetch', message: 'Sentry Tracker TTSL Fetch initialized', module: 'tracker', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker TTSL Fetch' });
}

async function main() {
	//

	const timer = new Timer();

	//
	// Fetch the TTSL Vehicle Events from the API
	// and save the new ones to the RawVehicleEvents collection

	const saveCount = await fetchVehicleEvents(ITERATION);

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from TTSL data in ${timer.get()}.` });

	ITERATION++;

	//
}

/* * */

await runOnInterval(main, { intervalMs: '1s', throwOnError: true });
