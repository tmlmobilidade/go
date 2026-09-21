/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { Timer } from '@tmlmobilidade/timer';

import { publishAgencies } from './tasks/publish-agencies.js';
import { publishApprovedPlans } from './tasks/publish-approved-plans.js';

/* * */

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await publishAgencies();

	await publishApprovedPlans();

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish plans data completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30m' });
