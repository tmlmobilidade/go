/* * */

import { publishApprovedPlans } from '@/tasks/publish-approved-plans.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const main = async () => {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await publishApprovedPlans();

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish plans data completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30m' });
