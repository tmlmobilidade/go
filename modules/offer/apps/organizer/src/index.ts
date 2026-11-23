/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { populateSimplifiedShapesTask } from './tasks/populate-simplified-shapes.js';
import { populateStopZonesTask } from './tasks/populate-stop-zones.js';

/* * */

async function main() {
	//

	Logger.init();

	const timer = new Timer();

	await populateStopZonesTask();
	await populateSimplifiedShapesTask();

	Logger.terminate(`Tasks completed in ${timer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '15m' });
