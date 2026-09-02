/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { performInChunks } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export interface RidesCallbackWindow {
	agency_id: string
	operational_dates: number[]
	trip_id: string
	window_end: number
	window_start: number
}

/* * */

/**
 * Callback function to set Rides as 'waiting' based on new SimplifiedVehicleEvent data.
 * This function identifies all Rides that are affected by the new data and marks them as 'waiting',
 * which will trigger the necessary reprocessing in the system.
 *
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

		const callbackWindowsMap = new Map<string, RidesCallbackWindow>();

		for (const item of data) {
			if (!item.trip_id) continue;

			const standardWindowInterval = Dates
				.fromUnixMilliseconds(item.created_at)
				.std_window;

			const windowStart = standardWindowInterval.start;
			const windowEnd = standardWindowInterval.end;

			const minOperationalDate = Dates.fromUnixMilliseconds(windowStart).operational_date_int;
			const maxOperationalDate = Dates.fromUnixMilliseconds(windowEnd).operational_date_int;
			const operationalDateRange = Array.from({ length: maxOperationalDate - minOperationalDate + 1 }, (_, i) => minOperationalDate + i);

			const window: RidesCallbackWindow = {
				agency_id: item.agency_id,
				operational_dates: operationalDateRange,
				trip_id: item.trip_id,
				window_end: windowEnd,
				window_start: windowStart,
			};

			callbackWindowsMap.set(
				`${window.agency_id}|${window.trip_id}|${window.window_start}|${window.window_end}`,
				window,
			);
		}

		const callbackWindows: RidesCallbackWindow[] = [...callbackWindowsMap.values()];

		if (!callbackWindows.length) return;

		//
		// Perform the operation in chunks to avoid hitting ClickHouse limits.

		await performInChunks(callbackWindows, async (chunk) => {
			//

			//
			// Get the native ClickHouse client.

			const clickhouseClient = await labDb.getClient();

			//
			// Build the ClickHouse query.

			const query = `
				WITH
					windows AS (
						SELECT
							arrayJoin(
								arrayZip(
									{agency_ids:Array(String)},
									{trip_ids:Array(String)},
									{window_starts:Array(Int64)},
									{window_ends:Array(Int64)},
									{operational_dates:Array(Array(UInt32))}
								)
							) AS window
					)
				SELECT r.*
				FROM operation.rides AS r
				CROSS JOIN windows
				WHERE
					r.agency_id = window.1
					AND r.operational_date IN window.5
					AND r.trip_id = window.2
					AND r.start_time_scheduled >= window.3
					AND r.start_time_scheduled <= window.4
				ORDER BY r.updated_at DESC
				LIMIT 1 BY r._id
			`;

			const queryResult = await clickhouseClient.query({
				format: 'JSONEachRow',
				query,
				query_params: {
					agency_ids: chunk.map(window => window.agency_id),
					operational_dates: chunk.map(window => [...new Set(window.operational_dates)]),
					trip_ids: chunk.map(window => window.trip_id),
					window_ends: chunk.map(window => window.window_end),
					window_starts: chunk.map(window => window.window_start),
				},
			});

			const matchingRides = await queryResult.json<Ride>();

			//
			// For the affected Rides, set them as 'waiting' and insert
			// a new document in the operation.rides_waiting collection.

			const now = Dates.now('utc').unix_milliseconds;

			const newRides: Ride[] = matchingRides.map(ride => ({
				...ride,
				processing_status: 'waiting',
				updated_at: now,
			}));

			await labDb.operation.rides.insert('JSONEachRow', newRides);

			Logger.info({
				message: `Marked as 'waiting': ${matchingRides.length} Rides (${timer.get()})`,
			});

			//
		}, 1_000);

		//
	} catch (error) {
		Logger.error({
			error,
			message: `Error in setRidesAsWaiting: ${error?.message ?? 'Unknown error'}`,
		});
	}
};
