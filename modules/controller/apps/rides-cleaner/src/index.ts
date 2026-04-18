/* * */

import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function reprocessStuckRides() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//
		// Get all 'processing' rides from the database

		const fetchTimerA = new Timer();

		const processingRidesA = await rides.findMany({ system_status: { $in: ['processing', 'error'] } });
		const processingRideIdsA = processingRidesA.map(item => item._id);

		const fetchTimerResultA = fetchTimerA.get();

		Logger.info(`A: Fetched ${processingRideIdsA.length} 'processing' rides. (${fetchTimerResultA})`);

		//
		// Wait 3 minutes before checking again

		await new Promise(resolve => setTimeout(resolve, 180000));

		//
		// It is unlikely for a Ride to be in the processing state for more than 3 minutes.
		// If it takes longer than that, then something happened (like a restart of the examiner
		// responsible for that ride) and the ride is considered stuck.
		// It should be marked as 'waiting' to be reprocessed.

		const fetchTimerB = new Timer();

		const processingRidesB = await rides.findMany({ system_status: { $in: ['processing', 'error'] } });
		const processingRideIdsB = processingRidesB.map(item => item._id);

		const fetchTimerResultB = fetchTimerB.get();

		Logger.info(`B: Fetched ${processingRideIdsB.length} 'processing' rides. (${fetchTimerResultB})`);

		//
		// Wait another 3 minutes before checking again

		await new Promise(resolve => setTimeout(resolve, 180000));

		//
		// Refetch the procesing rides a third time to make sure
		// we are not marking rides as stuck unnecessarily.

		const fetchTimerC = new Timer();

		const processingRidesC = await rides.findMany({ system_status: { $in: ['processing', 'error'] } });
		const processingRideIdsC = processingRidesC.map(item => item._id);

		const fetchTimerResultC = fetchTimerC.get();

		Logger.info(`C: Fetched ${processingRideIdsC.length} 'processing' rides. (${fetchTimerResultC})`);

		//
		// Now, we have two lists of stuck rides. We need to find the rides that are present
		// in the 3 lists to avoid reprocessing rides that were already reprocessed.

		const stuckRideIds = processingRideIdsA.filter(id => processingRideIdsB.includes(id) && processingRideIdsC.includes(id));

		//
		// Mark the rides as 'waiting' to be reprocessed.

		if (stuckRideIds.length > 0) {
			//

			const updateTimer = new Timer();

			const ridesCollection = await rides.getCollection();
			await ridesCollection.updateMany({ _id: { $in: stuckRideIds } }, { $set: { system_status: 'waiting' } });

			Logger.info(`Found ${stuckRideIds.length} stuck rides that were marked as 'waiting'. (${updateTimer.get()})`);
			Logger.spacer(1);

			//
		} else {
			Logger.info(`No stuck rides found!`);
			Logger.spacer(1);
		}

		//

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		Logger.error('An error occurred. Halting execution.', err);
		Logger.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}

	//
};

/* * */

await runOnInterval(reprocessStuckRides, { intervalMs: 10_000 }); // Run every 10 seconds
