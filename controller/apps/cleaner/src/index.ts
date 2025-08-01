/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { rides } from '@tmlmobilidade/interfaces';

/* * */

const RUN_INTERVAL = 10000; // 10 seconds

/* * */

async function reprocessStuckRides() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Get all 'processing' rides from the database

		const fetchTimerA = new TIMETRACKER();

		const processingRidesA = await rides.findMany({ system_status: { $in: ['processing', 'error'] } });
		const processingRideIdsA = processingRidesA.map(item => item._id);

		const fetchTimerResultA = fetchTimerA.get();

		LOGGER.info(`A: Fetched ${processingRideIdsA.length} 'processing' rides. (${fetchTimerResultA})`);

		//
		// Wait 3 minutes before checking again

		await new Promise(resolve => setTimeout(resolve, 180000));

		//
		// It is unlikely for a Ride to be in the processing state for more than 3 minutes.
		// If it takes longer than that, then something happened (like a restart of the examiner
		// responsible for that ride) and the ride is considered stuck.
		// It should be marked as 'waiting' to be reprocessed.

		const fetchTimerB = new TIMETRACKER();

		const processingRidesB = await rides.findMany({ system_status: { $in: ['processing', 'error'] } });
		const processingRideIdsB = processingRidesB.map(item => item._id);

		const fetchTimerResultB = fetchTimerB.get();

		LOGGER.info(`B: Fetched ${processingRideIdsB.length} 'processing' rides. (${fetchTimerResultB})`);

		//
		// Wait another 3 minutes before checking again

		await new Promise(resolve => setTimeout(resolve, 180000));

		//
		// Refetch the procesing rides a third time to make sure
		// we are not marking rides as stuck unnecessarily.

		const fetchTimerC = new TIMETRACKER();

		const processingRidesC = await rides.findMany({ system_status: { $in: ['processing', 'error'] } });
		const processingRideIdsC = processingRidesC.map(item => item._id);

		const fetchTimerResultC = fetchTimerC.get();

		LOGGER.info(`C: Fetched ${processingRideIdsC.length} 'processing' rides. (${fetchTimerResultC})`);

		//
		// Now, we have two lists of stuck rides. We need to find the rides that are present
		// in the 3 lists to avoid reprocessing rides that were already reprocessed.

		const stuckRideIds = processingRideIdsA.filter(id => processingRideIdsB.includes(id) && processingRideIdsC.includes(id));

		//
		// Mark the rides as 'waiting' to be reprocessed.

		if (stuckRideIds.length > 0) {
			//

			const updateTimer = new TIMETRACKER();

			const ridesCollection = await rides.getCollection();
			await ridesCollection.updateMany({ _id: { $in: stuckRideIds } }, { $set: { system_status: 'waiting' } });

			LOGGER.info(`Found ${stuckRideIds.length} stuck rides that were marked as 'waiting'. (${updateTimer.get()})`);
			LOGGER.spacer(1);

			//
		}
		else {
			LOGGER.info(`No stuck rides found!`);
			LOGGER.spacer(1);
		}

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}.`);

		//
	}
	catch (err) {
		LOGGER.error('An error occurred. Halting execution.', err);
		LOGGER.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
};

/* * */

(async function init() {
	const runOnInterval = async () => {
		await reprocessStuckRides();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
