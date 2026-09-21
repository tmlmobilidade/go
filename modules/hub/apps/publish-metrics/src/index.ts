/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { Timer } from '@tmlmobilidade/timer';

import { publishDemandByAgencyByOperationalDate } from './tasks/publish-demand-by-agency-by-operational-date.js';

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

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Finished publishing metrics data (${globalTimer.get()})`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
