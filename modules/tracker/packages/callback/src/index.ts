/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export interface TrackerRidesCallbackWindow {
	agency_id: string
	trip_id: string
	window_end: number
	window_start: number
}

/* * */

export function buildTrackerRidesCallbackQuery(windows: TrackerRidesCallbackWindow[]) {
	const conditions = windows.map((_, index) => `
		(
			r.agency_id = {agency_id_${index}:String}
			AND r.trip_id = {trip_id_${index}:String}
			AND r.start_time_scheduled >= {window_start_${index}:Int64}
			AND r.start_time_scheduled <= {window_end_${index}:Int64}
		)
	`);

	const query = `
		SELECT
			r.*
		FROM operation.rides AS r
		WHERE
			${conditions.join('\nOR\n')}
		ORDER BY
			r.updated_at DESC
		LIMIT 1 BY
			r._id
	`;

	const queryParams = Object.fromEntries(
		windows.flatMap((window, index) => [
			[`agency_id_${index}`, window.agency_id],
			[`trip_id_${index}`, window.trip_id],
			[`window_start_${index}`, window.window_start],
			[`window_end_${index}`, window.window_end],
		]),
	);

	return {
		query,
		queryParams,
	};
}

/**
 * Callback function to set Rides as 'waiting' based on new SimplifiedVehicleEvent data.
 * This function identifies all Rides that are affected by the new data and marks them as 'waiting',
 * which will trigger the necessary reprocessing in the system.
 * @param data An array of SimplifiedVehicleEvent documents that have been inserted or updated.
 */
export async function setRidesAsWaiting(data: SimplifiedVehicleEvent[]) {
	try {
		//

		const timer = new Timer();

		//
		// Skip if there's no data to process

		if (!data || data.length === 0) return;

		//
		// Build out the query to find all Rides
		// that are affected by the new data.

		const windows: TrackerRidesCallbackWindow[] = [

			...new Map(
				data
					.filter(item => !!item.trip_id)
					.map((item) => {
						const standardWindowInterval = Dates
							.fromUnixMilliseconds(item.created_at)
							.std_window;
						const window: TrackerRidesCallbackWindow = {
							agency_id: item.agency_id,
							trip_id: item.trip_id,
							window_end: standardWindowInterval.end,
							window_start: standardWindowInterval.start,
						};
						return [
							`${window.agency_id}|${window.trip_id}|${window.window_start}|${window.window_end}`,
							window,
						];
					}),
			).values(),
		];

		//
		// Skip if there are no valid queries to run

		if (!windows.length) return;

		//

		// Build the ClickHouse query and parameters.
		const {
			query,
			queryParams,
		} = buildTrackerRidesCallbackQuery(windows);

		//
		// Retrieve the latest version of all affected Rides.

		const clickhouseClient = await labDb.operation.rides.getClient();

		const result = await clickhouseClient.query({
			format: 'JSONEachRow',
			query,
			query_params: queryParams,
		});

		const matchingRides = await result.json<Ride>();

		//
		// For the affected Rides, set them as 'waiting' and insert a new document in the operation.rides_waiting collection.

		const now = Dates.now('utc').unix_milliseconds;

		const newRides: Ride[] = matchingRides.map(ride => ({
			...ride,
			processing_status: 'waiting',
			updated_at: now,
		}));

		await labDb.operation.rides.insert('JSONEachRow', newRides);

		Logger.info({ message: `Marked as 'waiting': ${matchingRides.length} Rides (${timer.get()})` });

		//
	} catch (error) {
		Logger.error({ error, message: `Error in setRidesAsWaiting: ${error?.message ?? 'Unknown error'}` });
	}
};
