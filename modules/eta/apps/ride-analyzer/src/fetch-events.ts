/* * */

import type { TripRef } from '@/parse-trip-ref.js';
import type { ClickHouseClient } from '@clickhouse/client';
import type { SimplifiedVehicleEvent } from '@tmlmobilidade/types';

import { Logger } from '@tmlmobilidade/logger';

/* * */

/**
 * Fetches every simplified vehicle event for the given trip from ClickHouse,
 * ordered chronologically. Filters by `trip_id` and `operational_date` (the
 * table ORDER BY prefix) so granules are pruned efficiently.
 */
export async function fetchEventsForTrip(clickhouseClient: ClickHouseClient, tripRef: TripRef): Promise<SimplifiedVehicleEvent[]> {
	Logger.title('Phase 2: Fetching simplified vehicle events');
	Logger.info(
		{ message: `Loading events for trip_id=${tripRef.tripId} operational_date=${tripRef.operationalDate}` + (tripRef.rideId ? ` (ride_id=${tripRef.rideId})` : '') },
	);
	const result = await clickhouseClient.query({
		format: 'JSONEachRow',
		query: `
			SELECT *
			FROM operation.simplified_vehicle_events
			WHERE trip_id = {trip_id:String}
			  AND operational_date = {operational_date:Date}
			ORDER BY created_at ASC
		`,
		query_params: {
			operational_date: tripRef.operationalDateClickHouse,
			trip_id: tripRef.tripId,
		},
	});

	const events = await result.json<SimplifiedVehicleEvent>();
	Logger.progress({ message: `Found ${events.length} events for trip_id=${tripRef.tripId}`, spacesAfterOrBefore: 1 });
	return events;
}
