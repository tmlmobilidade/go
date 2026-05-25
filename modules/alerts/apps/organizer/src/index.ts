/* * */

import { ensureStructure } from '@/tasks/ensure-structure.js';
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

	await ensureStructure();

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '1h' });
