/* * */

import { publishEta } from '@/tasks/eta/index.js';
import { publishVehiclesMetadata } from '@/tasks/publish-vehicles-metadata.js';
import { publishVehiclesPositions } from '@/tasks/publish-vehicles-positions.js';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

let ITERATION = 0;

const main = async () => {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.info('');
		Logger.logsNode({ app: 'publish-realtime', message: 'Sentry Hub Publish Realtime initialized', module: 'hub', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Hub Publish Realtime', error);
	}

	//
	// Initialize the logger

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
