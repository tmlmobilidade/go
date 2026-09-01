/* * */

import { ridesProvider } from '@tmlmobilidade/go-operation-pckg-utils';
import { performInChunks } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function cleanStuckRides() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Get all 'processing' rides from the database

	const fetchTimerA = new Timer();

	const processingRidesA = await ridesProvider.findRides({ processing_status: ['processing', 'error'] });
	const processingRideIdsA = processingRidesA.map(item => item._id);

	const fetchTimerResultA = fetchTimerA.get();

	Logger.info({ message: `A: Fetched ${processingRideIdsA.length} 'processing' rides. (${fetchTimerResultA})` });

	//
	// Wait 3 minutes before checking again

	await new Promise(resolve => setTimeout(resolve, 180000));

	//
	// It is unlikely for a Ride to be in the processing state for more than 3 minutes.
	// If it takes longer than that, then something happened (like a restart of the examiner
	// responsible for that ride) and the ride is considered stuck.
	// It should be marked as 'waiting' to be reprocessed.

	const fetchTimerB = new Timer();

	const processingRidesB = await ridesProvider.findRides({ processing_status: ['processing', 'error'] });
	const processingRideIdsB = processingRidesB.map(item => item._id);

	const fetchTimerResultB = fetchTimerB.get();

	Logger.info({ message: `B: Fetched ${processingRideIdsB.length} 'processing' rides. (${fetchTimerResultB})` });

	//
	// Wait another 3 minutes before checking again

	await new Promise(resolve => setTimeout(resolve, 180000));

	//
	// Refetch the procesing rides a third time to make sure
	// we are not marking rides as stuck unnecessarily.

	const fetchTimerC = new Timer();

	const processingRidesC = await ridesProvider.findRides({ processing_status: ['processing', 'error'] });
	const processingRideIdsC = processingRidesC.map(item => item._id);

	const fetchTimerResultC = fetchTimerC.get();

	Logger.info({ message: `C: Fetched ${processingRideIdsC.length} 'processing' rides. (${fetchTimerResultC})` });

	//
	// Now, we have two lists of stuck rides. We need to find the rides that are present
	// in the 3 lists to avoid reprocessing rides that were already reprocessed.

	const stuckRideIds = processingRideIdsA.filter(id => processingRideIdsB.includes(id) && processingRideIdsC.includes(id));

	//
	// Mark the rides as 'waiting' to be reprocessed.

	if (stuckRideIds.length > 0) {
		Logger.info({ message: `Found ${stuckRideIds.length} stuck rides that will be marked as 'waiting'.` });
		await performInChunks(stuckRideIds, async (chunk) => {
			const updateTimer = new Timer();
			await ridesProvider.updateRides({ _id: chunk }, { processing_status: 'waiting' });
			Logger.info({ message: `Marked ${chunk.length} stuck rides as 'waiting'. (${updateTimer.get()})` });
			Logger.spacer(1);
		}, 300);
	} else {
		Logger.info({ message: `No stuck rides found!` });
		Logger.spacer(1);
	}

	Logger.terminate(`Cleaned ${stuckRideIds.length} stuck rides in ${globalTimer.get()}.`);
};
