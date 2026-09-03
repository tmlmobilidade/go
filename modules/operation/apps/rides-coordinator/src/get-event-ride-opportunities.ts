/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RidesCoordinatorEventRideOpportunitiesResponse } from '@tmlmobilidade/go-operation-pckg-types';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

let IS_BUSY = false;

/* * */

export async function getEventRideOpportunities(): Promise<RidesCoordinatorEventRideOpportunitiesResponse> {
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
			return { ids: [] };
		}

		//
		// Set the busy flag to prevent other requests
		// from being processed until the current one is done.

		IS_BUSY = true;

		//
		// Find all Ride IDs that are waiting analysis and which started before the current time,
		// sorted in descending order to prioritize the most recent Rides.

		const fetchTimer = new Timer();

		const latestWaitingEventRideOpportunities = await labDb.operation.eventRideOpportunities.queryFromString(
			`
				SELECT *
				FROM operation.event_ride_opportunities FINAL
				WHERE processing_status = 'waiting'
				ORDER BY window_start DESC
				LIMIT 750
			`,
		);

		/* === FOR TESTING === */
		// const latestWaitingRides = await rides.findMany({ _id: 'DC0XN-44-20250303-4412_0_2|300|1955' })
		/* === FOR TESTING === */

		const fetchTimerResult = fetchTimer.get();

		if (!latestWaitingEventRideOpportunities.length) {
			Logger.info({ message: `[${sessionId}] No documents waiting` });
			IS_BUSY = false;
			return { ids: [] };
		}

		//
		// Mark those documents as 'processing' to ensure the next batch does not include them,
		// and return them to the caller instance. ReplacingMergeTree versions rows by insert.

		const markTimer = new Timer();

		const latestWaitingEventRideOpportunitiesIds = latestWaitingEventRideOpportunities.map(item => item._id);

		await labDb.operation.eventRideOpportunities.insert(
			'JSONEachRow',
			latestWaitingEventRideOpportunities.map(item => ({
				...item,
				processing_status: 'processing',
				updated_at: Dates.now('utc').unix_milliseconds,
			})),
		);

		Logger.info({ message: `[${sessionId}] New batch: Qty ${latestWaitingEventRideOpportunitiesIds.length} (fetch: ${fetchTimerResult} | total: ${markTimer.get()})` });

		IS_BUSY = false;

		return { ids: latestWaitingEventRideOpportunitiesIds };

		//
	} catch (error) {
		Logger.error({ error, message: `[${sessionId}] Error getting rides: ${error.message}` });
		IS_BUSY = false;
		return { ids: [] };
	}
}
