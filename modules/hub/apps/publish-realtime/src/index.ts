/* * */

import { publishTripUpdates } from '@/tasks/publish-trip-updates.js';
import { publishVehiclesMetadata } from '@/tasks/publish-vehicles-metadata.js';
import { publishVehiclesPositions } from '@/tasks/publish-vehicles-positions.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

let ITERATION = 0;

const main = async () => {
	//

	Logger.title(`[${ITERATION}] Publishing realtime data...`);

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await publishVehiclesPositions();

	if (ITERATION % 30 === 0) await publishVehiclesMetadata(); // Every 30 iterations * 1s = 30 seconds
	if (ITERATION % 30 === 0) await publishTripUpdates(); // Every 30 iterations * 1s = 30 seconds

	ITERATION++;

	//
	// Log the total time taken for all tasks

	Logger.terminate(`[${ITERATION}] Publish realtime data completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '1s' });
