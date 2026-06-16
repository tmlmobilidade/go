/* * */

import { organizeStop } from '@tmlmobilidade/go-stops-pckg-organize';
import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'organizer', message: 'Sentry Stops Organizer initialized', module: 'stops', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Stops Organizer', error);
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Get all Stop documents from the database

	const allStopsData = await stops.all();

	Logger.info(`Found ${allStopsData.length} stops.`);

	//
	// Loop through all stops and request updated attributes for each document

	for (const [stopIndex, stopData] of allStopsData.entries()) {
		//

		Logger.info(`[${allStopsData.length - stopIndex}/${allStopsData.length}] Processing Stop ${stopData._id}...`);

		const organizedStopData = await organizeStop(stopData);

		await stops.updateById(stopData._id, organizedStopData);

		//
	}

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
}

await runOnInterval(main, { intervalMs: '5m' });
