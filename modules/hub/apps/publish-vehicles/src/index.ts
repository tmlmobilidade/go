/* * */

import { publishVehicleMetadata } from '@/tasks/publish-vehicle-metadata.js';
import { publishVehiclePositions } from '@/tasks/publish-vehicle-positions.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

let ITERATION = 0;

const main = async () => {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	if (ITERATION % 100 === 0) await publishVehicleMetadata();

	await publishVehiclePositions();

	ITERATION++;

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish alerts completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s' });
