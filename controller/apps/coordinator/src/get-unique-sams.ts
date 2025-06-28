/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { uniqueSams } from '@tmlmobilidade/interfaces';
import { ProcessingStatus } from '@tmlmobilidade/types';

/* * */

let isBusy = false;

/* * */

export async function getUniqueSams(): Promise<number[]> {
	//

	const uniqueSamsCollection = await uniqueSams.getCollection();

	//
	// The whole point of a coordinator is to prevent multiple instances
	// from processing the same documents at the same time. For that reason,
	// we need to make sure that instances request the next batch of documents
	// sequentially. To do that, we implement a simple lock mechanism.

	while (isBusy) {
		LOGGER.info('[unique-sams] Waiting for another request to complete...');
		await new Promise(resolve => setTimeout(resolve, 500));
	}

	//
	// Set the busy flag to prevent other requests
	// from being processed until the current one is done.

	isBusy = true;

	//
	// Find all Unique SAM IDs that are waiting analysis and which started before the current time,
	// sorted in descending order to prioritize the most recent Unique SAMs.

	const batchSize = 5;

	const fetchTimer = new TIMETRACKER();

	const latestWaitingUniqueSams = await uniqueSamsCollection
		.find({ system_status: ProcessingStatus.Waiting })
		.limit(batchSize)
		.toArray();

	/* === FOR TESTING === */
	// const latestWaitingUniqueSams = await uniqueSamsCollection
	// 	.find({ _id: 'DC0XN-44-20250303-4412_0_2|300|1955' })
	// 	.toArray();
	/* === FOR TESTING === */

	const latestWaitingUniqueSamsIds = latestWaitingUniqueSams.map(item => item._id);

	const fetchTimerResult = fetchTimer.get();

	if (latestWaitingUniqueSamsIds.length === 0) {
		LOGGER.info(`[unique-sams] No documents waiting (fetch: ${fetchTimerResult})`);
		isBusy = false;
		return [];
	}

	//
	// Mark those Unique SAMs as 'processing' to ensure the next batch of Unique SAMs does not include them,
	// and return them to the caller instance.

	const markTimer = new TIMETRACKER();

	await uniqueSamsCollection.updateMany({ _id: { $in: latestWaitingUniqueSamsIds } }, { $set: { system_status: ProcessingStatus.Processing } });

	LOGGER.info(`New batch: Qty ${latestWaitingUniqueSamsIds.length} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})`);

	isBusy = false;

	return latestWaitingUniqueSamsIds;

	//
}
