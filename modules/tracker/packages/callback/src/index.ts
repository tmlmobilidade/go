/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { performInChunks } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export interface TrackerRidesCallbackWindow {
	agency_id: string
	trip_id: string
	window_end: number
	window_start: number
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

		await performInChunks(data, async (chunk) => {
			//

			//
			// Build out the query to find all Rides
			// that are affected by the new data.

			const callbackWindowsMap = new Map<string, TrackerRidesCallbackWindow>();

			for (const item of chunk) {
				if (!item.trip_id) continue;
				const standardWindowInterval = Dates
					.fromUnixMilliseconds(item.created_at)
					.std_window;
				const window: TrackerRidesCallbackWindow = {
					agency_id: item.agency_id,
					trip_id: item.trip_id,
					window_end: standardWindowInterval.end,
					window_start: standardWindowInterval.start,
				};
				callbackWindowsMap.set(`${window.agency_id}|${window.trip_id}|${window.window_start}|${window.window_end}`, window);
			}

			const callbackWindows: TrackerRidesCallbackWindow[] = [...callbackWindowsMap.values()];

			if (!callbackWindows.length) return;

			//
			// Build the ClickHouse query and parameters.

			const conditions = callbackWindows.map((_, index) => {
				const paramIndex = index * 4;
				return `
					(
						agency_id = $${paramIndex}
						AND trip_id = $${paramIndex + 1}
						AND start_time_scheduled >= $${paramIndex + 2}
						AND start_time_scheduled <= $${paramIndex + 3}
					)
				`;
			});

			const query = `
				SELECT *
				FROM operation.rides
				WHERE ${conditions.join('\nOR\n')}
				ORDER BY updated_at DESC
				LIMIT 1 BY _id
			`;

			const queryParams = Object.fromEntries(
				callbackWindows.flatMap((window, index) => {
					const paramIndex = index * 4;
					return [
						[paramIndex, window.agency_id],
						[paramIndex + 1, window.trip_id],
						[paramIndex + 2, window.window_start],
						[paramIndex + 3, window.window_end],
					];
				}),
			);

			//
			// Retrieve the latest version of all affected Rides.

			const matchingRides = await labDb.queryFromString<Ride>(query, queryParams);

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
		}, 100); // The chunk size

		//
	} catch (error) {
		Logger.error({ error, message: `Error in setRidesAsWaiting: ${error?.message ?? 'Unknown error'}` });
	}
};
