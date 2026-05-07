/* * */

import { ensureStructure } from '@/tasks/ensure-structure.js';
import { publishGtfsRtFeed } from '@/tasks/publish-gtfs-rt-feed.js';
import { publishJsonFeed } from '@/tasks/publish-json-feed.js';
import { publishRssFeed } from '@/tasks/publish-rss-feed.js';
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

	if (ITERATIONS_COUNTER % 10 === 0) await ensureStructure();

	await publishGtfsRtFeed();

	await publishJsonFeed();

	await publishRssFeed();

	//
	// Log the total time taken for all tasks

	ITERATIONS_COUNTER++;

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s' });
