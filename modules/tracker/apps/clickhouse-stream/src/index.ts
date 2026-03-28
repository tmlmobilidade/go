/* * */

import { processVehicleEvent } from '@/task.js';
import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const DEFAULT_CONCURRENCY = 16;
const DEFAULT_SYNC_GRACE_PERIOD_SECONDS = 5 * 60;

async function getMinimumCreatedAtThreshold() {
	const latestRawVehicleEvent = await rawVehicleEventsNew.findOne(
		{},
		{
			projection: { created_at: 1 },
			sort: { created_at: -1 },
		},
	);

	if (typeof latestRawVehicleEvent?.created_at !== 'number') return null;
	return latestRawVehicleEvent.created_at - DEFAULT_SYNC_GRACE_PERIOD_SECONDS;
}

(async function init() {
	//

	const minimumCreatedAtThreshold = await getMinimumCreatedAtThreshold();

	if (minimumCreatedAtThreshold === null) {
		Logger.info('[clickhouse-stream] No latest raw event found. Processing all incoming insert events.');
	} else {
		Logger.info(`[clickhouse-stream] Syncing insert events newer than created_at > ${minimumCreatedAtThreshold} (latest - 5 minutes).`);
	}

	//
	// Watch for changes to the rawVehicleEventsNew collection
	// and integrate those documents immediately.

	const collection = await rawVehicleEventsNew.getCollection();

	const changeStream = collection.watch(
		minimumCreatedAtThreshold === null
			? []
			: [{ $match: { 'fullDocument.created_at': { $gt: minimumCreatedAtThreshold }, 'operationType': 'insert' } }],
	);
	const inFlight = new Set<Promise<void>>();

	for await (const change of changeStream) {
		//

		//
		// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
		// Only insert operations are expected to occur in this PCGIDB collection.

		if (change.operationType !== 'insert') {
			Logger.error(`[clickhouse-stream] WARNING: changeStream document with operationType != "insert": operationType="${change.operationType}" _id="${change._id}"`);
			continue;
		}

		if (minimumCreatedAtThreshold !== null && change.fullDocument.created_at <= minimumCreatedAtThreshold) {
			continue;
		}

		const taskPromise = processVehicleEvent(change)
			.catch((error) => {
				Logger.error(`[clickhouse-stream] Error processing vehicle event: ${(error as Error).message}`);
			})
			.finally(() => {
				inFlight.delete(taskPromise);
			});

		inFlight.add(taskPromise);

		if (inFlight.size >= DEFAULT_CONCURRENCY) {
			await Promise.race(inFlight);
		}
	}

	await Promise.allSettled([...inFlight]);

	//
})();
