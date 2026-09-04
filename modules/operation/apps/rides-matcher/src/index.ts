/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RidesCoordinatorRideMatchesResponse } from '@tmlmobilidade/go-operation-pckg-types';
import { getCoordinatorUrl, ridesProvider } from '@tmlmobilidade/go-operation-pckg-utils';
import { type RideMatch } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'rides-matcher', message: 'Sentry Rides Matcher initialized', module: 'controller', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Rides Matcher' });
}

async function main() {
	//

	try {
		Logger.init();

		const globalTimer = new Timer();

		//
		// Ask the coordinator for a new batch of ride matches to process

		const fetchCoordinatorTimer = new Timer();

		const rideMatchIds = await fetch(getCoordinatorUrl('ride-matches'))
			.then(response => response.json())
			.then(data => data as RidesCoordinatorRideMatchesResponse)
			.then(data => data.ids);

		if (!rideMatchIds.length) {
			console.log(`No ride matches to process. Skipping run. (fetch: ${fetchCoordinatorTimer.get()})`);
			return;
		}

		console.log(`Received ride match IDs from coordinator: ${rideMatchIds.join(', ')} (fetch: ${fetchCoordinatorTimer.get()})`);

		//
		// Retrieve the ride matches from the database

		const query = `
            WITH
                ride_matches AS (
                    SELECT *
                    FROM operation.ride_matches FINAL
                    WHERE _id IN $1
                )
            SELECT r._id
            FROM operation.rides AS r FINAL
            CROSS JOIN ride_matches AS e
            WHERE
                r.agency_id = e.agency_id
                AND r.operational_date IN e.operational_dates
                AND r.trip_id = e.trip_id
                AND r.start_time_scheduled >= e.window_start
                AND r.start_time_scheduled <= e.window_end
            ORDER BY r.updated_at DESC
            LIMIT 1 BY r._id
        `;

		const matchingRides = await labDb.queryFromString<{ _id: string }>(query, { 1: rideMatchIds });
		const matchingRidesIds = matchingRides.map(ride => ride._id);

		//
		// Update the Rides as 'waiting'

		if (matchingRidesIds.length) {
			await ridesProvider.updateRides({ _id: matchingRidesIds }, { processing_status: 'waiting' });
		}

		//
		// Mark the Ride Matches as 'complete' by inserting new ReplacingMergeTree versions.

		const rideMatches = await labDb.queryFromString<RideMatch>(
			`
                SELECT *
                FROM operation.ride_matches FINAL
                WHERE _id IN $1
            `,
			{ 1: rideMatchIds },
		);

		if (rideMatches.length) {
			await labDb.operation.rideMatches.insert(
				'JSONEachRow',
				rideMatches.map(item => ({
					...item,
					processing_status: 'complete',
					updated_at: Dates.now('utc').unix_milliseconds,
				})),
			);
		}

		Logger.terminate(`Run took ${globalTimer.get()}`);
	} catch (error) {
		Logger.error({ error, message: 'Error matching rides' });
	}
};

/* * */

await runOnInterval(main, { intervalMs: '10s' });
