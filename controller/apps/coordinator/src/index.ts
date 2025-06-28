/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { rides } from '@tmlmobilidade/interfaces';
import { ProcessingStatus } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import Fastify from 'fastify';

/* * */

(async function init() {
	//

	//
	// Setup variables

	const fastify = Fastify({ logger: false });

	const ridesCollection = await rides.getCollection();

	let isBusy = false;

	//
	// Setup the API service

	fastify.get('/', async () => {
		//

		//
		// The whole point of a coordinator is to prevent multiple instances
		// from processing the same documents at the same time. For that reason,
		// we need to make sure that instances request the next batch of documents
		// sequentially. To do that, we implement a simple lock mechanism.

		while (isBusy) {
			LOGGER.info('Waiting for another request to complete...');
			await new Promise(resolve => setTimeout(resolve, 500));
		}

		//
		// Set the busy flag to prevent other requests
		// from being processed until the current one is done.

		isBusy = true;

		//
		// Find all ride IDs that are waiting analysis and which started before the current time,
		// sorted in descending order to prioritize the most recent rides.

		const batchSize = 750;
		const standardWindowInterval = Dates.now('utc').std_window;

		const fetchTimer = new TIMETRACKER();

		const latestWaitingRides = await ridesCollection
			.find({ is_locked: false, start_time_scheduled: { $lte: standardWindowInterval.end }, system_status: ProcessingStatus.Waiting })
			.sort({ start_time_scheduled: -1 })
			.limit(batchSize)
			.toArray();

		/* === FOR TESTING === */
		// const latestWaitingRides = await ridesCollection
		// 	.find({ _id: 'DC0XN-44-20250303-4412_0_2|300|1955' })
		// 	.toArray();
		/* === FOR TESTING === */

		const latestWaitingRidesIds = latestWaitingRides.map(ride => ride._id);

		const fetchTimerResult = fetchTimer.get();

		if (latestWaitingRidesIds.length === 0) {
			LOGGER.info(`No rides to process | start_time_scheduled: ${standardWindowInterval.end} (fetch: ${fetchTimerResult})`);
			isBusy = false;
			return [];
		}

		//
		// Mark those rides as 'processing' to ensure the next batch of rides does not include them,
		// and return them to the caller instance.

		const markTimer = new TIMETRACKER();

		await ridesCollection.updateMany({ _id: { $in: latestWaitingRidesIds } }, { $set: { system_status: ProcessingStatus.Processing } });

		LOGGER.info(`New batch: Qty ${latestWaitingRidesIds.length} | start_time_scheduled: ${latestWaitingRides.pop().start_time_scheduled} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})`);

		isBusy = false;

		return latestWaitingRidesIds;

		//
	});

	//
	// Start the API service

	fastify.listen({ host: '::0', port: 5050 }, (err, address) => {
		if (err) {
			console.log(err);
			process.exit(1);
		}
		LOGGER.info(`Server listening at ${address}`);
	});

	//
})();
