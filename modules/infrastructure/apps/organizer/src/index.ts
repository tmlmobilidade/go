/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { setStopLocationTask } from './tasks/set-stop-location.js';

/* * */

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run tasks

	await setStopLocationTask();

	//
	// Log completion

	Logger.terminate(`Tasks completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
