/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { sams } from '@tmlmobilidade/interfaces';

/* * */

let isBusy = false;

/* * */

export async function getSams(): Promise<number[]> {
	//

	const samsCollection = await sams.getCollection();

	//
	// The whole point of a coordinator is to prevent multiple instances
	// from processing the same documents at the same time. For that reason,
	// we need to make sure that instances request the next batch of documents
	// sequentially. To do that, we implement a simple lock mechanism.

	while (isBusy) {
		LOGGER.info('[sams] Waiting for another request to complete...');
		await new Promise(resolve => setTimeout(resolve, 500));
	}

	//
	// Set the busy flag to prevent other requests
	// from being processed until the current one is done.

	isBusy = true;

	//
	// Find all Unique SAM IDs that are waiting analysis and which started before the current time,
	// sorted in descending order to prioritize the most recent Unique SAMs.

	const batchSize = 1000;

	const fetchTimer = new TIMETRACKER();

	const latestWaitingSams = await samsCollection
		.find({ system_status: 'waiting' })
		.limit(batchSize)
		.toArray();

	/* === FOR TESTING === */
	// const latestWaitingSams = await samsCollection
	// 	.find({ _id: 'DC0XN-44-20250303-4412_0_2|300|1955' })
	// 	.toArray();
	/* === FOR TESTING === */

	const latestWaitingSamsIds = latestWaitingSams.map(item => item._id);

	const fetchTimerResult = fetchTimer.get();

	if (latestWaitingSamsIds.length === 0) {
		LOGGER.info(`[sams] No documents waiting (fetch: ${fetchTimerResult})`);
		isBusy = false;
		return [];
	}

	//
	// Mark those Unique SAMs as 'processing' to ensure the next batch of Unique SAMs does not include them,
	// and return them to the caller instance.

	const markTimer = new TIMETRACKER();

	await samsCollection.updateMany({ _id: { $in: latestWaitingSamsIds } }, { $set: { system_status: 'processing' } });

	LOGGER.info(`[sams] New batch: Qty ${latestWaitingSamsIds.length} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})`);

	isBusy = false;

	return latestWaitingSamsIds;

	//
}
