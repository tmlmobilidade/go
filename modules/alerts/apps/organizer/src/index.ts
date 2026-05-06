/* * */

import { buildGtfsRtFeed } from '@/tasks/build-gtfs-rt-feed.js';
import { ensureStructure } from '@/tasks/ensure-structure.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

let ITERATIONS_COUNTER = 0;

const main = async () => {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	// if (ITERATIONS_COUNTER % 100 === 0) await ensureStructure();

	await buildGtfsRtFeed();

	//
	// Log the total time taken for all tasks

	ITERATIONS_COUNTER++;

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s' });
