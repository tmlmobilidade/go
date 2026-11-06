import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { populateStopZonesTask } from './tasks/populate-stop-zones.js';

async function main() {
	Logger.init();
	const timer = new Timer();
	await populateStopZonesTask();
	Logger.terminate(`Tasks completed in ${timer.get()}`);
}

// Route recalculation fills zones immediately; this periodic pass repairs missing assignments.
await runOnInterval(main, { intervalMs: '15m' });
