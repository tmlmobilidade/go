/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RidesCoordinatorEventRideOpportunitiesResponse } from '@tmlmobilidade/go-operation-pckg-types';
import { getCoordinatorUrl, ridesProvider } from '@tmlmobilidade/go-operation-pckg-utils';
import { type EventRideOpportunity } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'rides-resolver', message: 'Sentry Rides Resolver initialized', module: 'controller', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Rides Resolver' });
}

async function main() {
	//

	try {
		Logger.init();

		const globalTimer = new Timer();

		//
		// Ask the coordinator for a new Plan ID to process

		const fetchCoordinatorTimer = new Timer();

		const eventRideOpportunitiesIds = await fetch(getCoordinatorUrl('event-ride-opportunities'))
			.then(response => response.json())
			.then(data => data as RidesCoordinatorEventRideOpportunitiesResponse)
			.then(data => data.ids);

		if (!eventRideOpportunitiesIds.length) {
			console.log(`No event ride opportunities to process. Skipping run. (fetch: ${fetchCoordinatorTimer.get()})`);
			return;
		}

		console.log(`Received event ride opportunities IDs from coordinator: ${eventRideOpportunitiesIds.join(', ')} (fetch: ${fetchCoordinatorTimer.get()})`);

		//
		// Retrieve the event ride opportunities from the database

		const query = `
            WITH
                event_ride_opportunities AS (
                    SELECT *
                    FROM operation.event_ride_opportunities FINAL
                    WHERE _id IN $1
                )
            SELECT r._id
            FROM operation.rides AS r FINAL
            CROSS JOIN event_ride_opportunities AS e
            WHERE
                r.agency_id = e.agency_id
                AND r.operational_date IN e.operational_dates
                AND r.trip_id = e.trip_id
                AND r.start_time_scheduled >= e.window_start
                AND r.start_time_scheduled <= e.window_end
            ORDER BY r.updated_at DESC
            LIMIT 1 BY r._id
        `;

		const matchingRides = await labDb.queryFromString<{ _id: string }>(query, { 1: eventRideOpportunitiesIds });
		const matchingRidesIds = matchingRides.map(ride => ride._id);

		//
		// Update the Rides as 'waiting'

		if (matchingRidesIds.length) {
			await ridesProvider.updateRides({ _id: matchingRidesIds }, { processing_status: 'waiting' });
		}

		//
		// Mark the Event Ride Opportunities as 'complete' by inserting new ReplacingMergeTree versions.

		const eventRideOpportunities = await labDb.queryFromString<EventRideOpportunity>(
			`
                SELECT *
                FROM operation.event_ride_opportunities FINAL
                WHERE _id IN $1
            `,
			{ 1: eventRideOpportunitiesIds },
		);

		if (eventRideOpportunities.length) {
			await labDb.operation.eventRideOpportunities.insert(
				'JSONEachRow',
				eventRideOpportunities.map(item => ({
					...item,
					processing_status: 'complete',
					updated_at: Dates.now('utc').unix_milliseconds,
				})),
			);
		}

		Logger.terminate(`Run took ${globalTimer.get()}`);
	} catch (error) {
		Logger.error({ error, message: 'Error resolving rides' });
	}
};

/* * */

await runOnInterval(main, { intervalMs: '10s' });
