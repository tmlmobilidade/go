/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { ensureLegacyIdsTask } from './tasks/ensure-legacy-ids.js';
import { setStopLocationTask } from './tasks/set-stop-location.js';
import { syncLabdbTask } from './tasks/sync-labdb.js';

/* * */

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run tasks

	await ensureLegacyIdsTask();
	await setStopLocationTask();
	await syncLabdbTask();

	//
	// Log completion

	Logger.terminate(`Tasks completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
