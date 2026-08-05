/* * */

import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

let IS_BUSY = false;

/* * */

export async function getRides(): Promise<string[]> {
	//

	const timer = new Timer();
	const sessionId = Math.random().toString(36).substring(2, 5).toUpperCase();

	try {
		//

		//
		// The whole point of a coordinator is to prevent multiple instances
		// from processing the same documents at the same time. For that reason,
		// we need to make sure that instances request the next batch of documents
		// sequentially. To do that, we implement a simple lock mechanism.

		if (IS_BUSY) {
			Logger.info({ message: `[${sessionId}] Waiting for another request to complete... (elapsed: ${timer.get()})` });
			return [];
		}

		//
		// Set the busy flag to prevent other requests
		// from being processed until the current one is done.

		IS_BUSY = true;

		//
		// Find all Ride IDs that are waiting analysis and which started before the current time,
		// sorted in descending order to prioritize the most recent Rides.

		const fetchTimer = new Timer();

		const standardWindowInterval = Dates.now('utc').minus({ days: 1 }).std_window;

		const latestWaitingRides: Pick<Ride, '_id' | 'operational_date' | 'start_time_scheduled'>[] = await labDb.operation.rides.select(
			'_id, operational_date, start_time_scheduled',
			'start_time_scheduled <= $1 AND processing_status = \'waiting\' ORDER BY start_time_scheduled DESC LIMIT 750',
			{ 1: standardWindowInterval.end },
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

		await labDb.operation.rides.queryFromString('UPDATE rides SET processing_status = \'processing\' WHERE _id IN ($1)', { 1: latestWaitingRidesIds.join(',') });

		Logger.info({ message: `[${sessionId}] New batch: Qty ${latestWaitingRidesIds.length} | operational_date: ${latestWaitingRides[latestWaitingRides.length - 1].operational_date} | start_time_scheduled: ${latestWaitingRides[latestWaitingRides.length - 1].start_time_scheduled} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})` });

		IS_BUSY = false;

		return latestWaitingRidesIds;

		//
	} catch (error) {
		Logger.error({ error, message: `[${sessionId}] Error getting rides: ${error.message}` });
		return [];
	}
}
