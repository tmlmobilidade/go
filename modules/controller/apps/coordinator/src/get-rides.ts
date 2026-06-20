/* * */

import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

let isBusy = false;

/* * */

export async function getRides(): Promise<string[]> {
	//

	const ridesCollection = await rides.getCollection();

	//
	// The whole point of a coordinator is to prevent multiple instances
	// from processing the same documents at the same time. For that reason,
	// we need to make sure that instances request the next batch of documents
	// sequentially. To do that, we implement a simple lock mechanism.

	while (isBusy) {
		Logger.info({ message: '[rides] Waiting for another request to complete...' });
		await new Promise(resolve => setTimeout(resolve, 500));
	}

	//
	// Set the busy flag to prevent other requests
	// from being processed until the current one is done.

	isBusy = true;

	//
	// Find all Ride IDs that are waiting analysis and which started before the current time,
	// sorted in descending order to prioritize the most recent Rides.

	const fetchTimer = new Timer();

	const standardWindowInterval = Dates.now('utc').std_window;

	const latestWaitingRides = await ridesCollection
		.find({ start_time_scheduled: { $lte: standardWindowInterval.end }, system_status: 'waiting' })
		.sort({ start_time_scheduled: -1 })
		.limit(750)
		.toArray();

	/* === FOR TESTING === */
	// const latestWaitingRides = await ridesCollection
	// 	.find({ _id: 'DC0XN-44-20250303-4412_0_2|300|1955' })
	// 	.toArray();
	/* === FOR TESTING === */

	const fetchTimerResult = fetchTimer.get();

	if (!latestWaitingRides.length) {
		Logger.info({ message: `[rides] No documents waiting | start_time_scheduled: ${standardWindowInterval.end} (fetch: ${fetchTimerResult})` });
		isBusy = false;
		return [];
	}

	//
	// Mark those Rides as 'processing' to ensure the next batch of Rdes does not include them,
	// and return them to the caller instance.

	const markTimer = new Timer();

	const latestWaitingRidesIds = latestWaitingRides.map(item => item._id);

	await ridesCollection.updateMany({ _id: { $in: latestWaitingRidesIds } }, { $set: { system_status: 'processing' } });

	Logger.info({ message: `[rides] New batch: Qty ${latestWaitingRidesIds.length} | start_time_scheduled: ${latestWaitingRides[latestWaitingRides.length - 1].start_time_scheduled} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})` });

	isBusy = false;

	return latestWaitingRidesIds;

	//
}
