/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { publishDemandByAgencyByOperationalDate } from './tasks/publish-demand-by-agency-by-operational-date.js';
import { publishVehicleEventsLast24h } from './tasks/publish-vehicle-events-last-24h.js';

/* * */

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();
	Logger.title('Starting metrics data publishing...');

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await publishDemandByAgencyByOperationalDate();
	await publishVehicleEventsLast24h();

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Finished publishing metrics data (${globalTimer.get()})`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
