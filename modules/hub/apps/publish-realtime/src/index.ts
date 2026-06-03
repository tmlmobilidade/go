/* * */

import { publishVehiclesMetadata } from '@/tasks/publish-vehicles-metadata.js';
import { publishVehiclesPositions } from '@/tasks/publish-vehicles-positions.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

import { publishEta } from './tasks/eta/index.js';

/* * */

let ITERATION = 0;

const main = async () => {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	await publishVehiclesPositions();

	if (ITERATION % 100 === 0) await publishVehiclesMetadata();
	if (ITERATION % 100 === 0) await publishEta();

	ITERATION++;

	//
	// Log the total time taken for all tasks

	Logger.terminate(`Publish realtime data completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '1s' });
