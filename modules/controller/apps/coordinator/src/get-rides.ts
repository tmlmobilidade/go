/* * */

import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

let IS_BUSY = false;

/* * */

export async function getRides(): Promise<string[]> {
	//

	//
	// The whole point of a coordinator is to prevent multiple instances
	// from processing the same documents at the same time. For that reason,
	// we need to make sure that instances request the next batch of documents
	// sequentially. To do that, we implement a simple lock mechanism.

	const sessionId = Math.random().toString(36).substring(2, 15);

	while (IS_BUSY) {
		Logger.info({ message: `[${sessionId}] Waiting for another request to complete...` });
		await new Promise(resolve => setTimeout(resolve, 500));
	}

	//
	// Get the next batch of rides

	try {
		//

		//
		// Set the busy flag to prevent other requests
		// from being processed until the current one is done.

		IS_BUSY = true;

		//
		// Find all Ride IDs that are waiting analysis and which started before the current time,
		// sorted in descending order to prioritize the most recent Rides.

		const fetchTimer = new Timer();

		const standardWindowInterval = Dates.now('utc').std_window;

		const latestWaitingRides = await rides.findMany(
			{
				agency_id: { $in: ['41', '42', '43', '44'] },
				start_time_scheduled: { $lte: standardWindowInterval.end },
				system_status: 'waiting',
			},
			{
				limit: 750,
				projection: { _id: 1 },
				sort: { start_time_scheduled: -1 },
			},
		);

		/* === FOR TESTING === */
		// const latestWaitingRides = await rides.findMany({ _id: 'DC0XN-44-20250303-4412_0_2|300|1955' })
		/* === FOR TESTING === */

		const fetchTimerResult = fetchTimer.get();

		if (!latestWaitingRides.length) {
			Logger.info({ message: `[${sessionId}] No documents waiting | start_time_scheduled: ${standardWindowInterval.end} (fetch: ${fetchTimerResult})` });
			return [];
		}

		//
		// Mark those Rides as 'processing' to ensure the next batch of Rdes does not include them,
		// and return them to the caller instance.

		const markTimer = new Timer();

		const latestWaitingRidesIds = latestWaitingRides.map(item => item._id);

		await rides.updateMany({ _id: { $in: latestWaitingRidesIds } }, { system_status: 'processing' });

		Logger.info({ message: `[${sessionId}] New batch: Qty ${latestWaitingRidesIds.length} | start_time_scheduled: ${latestWaitingRides[latestWaitingRides.length - 1].start_time_scheduled} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})` });

		return latestWaitingRidesIds;

		//
	} catch (error) {
		Logger.error({ error, message: `[${sessionId}] Error getting rides: ${error.message}` });
		return [];
	} finally {
		IS_BUSY = false;
		Logger.info({ message: `[${sessionId}] Session completed` });
	}
}
