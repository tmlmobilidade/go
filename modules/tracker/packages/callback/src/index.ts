/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { EventRideOpportunity } from '@tmlmobilidade/go-types-operation';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

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
		// Build processing windows for all Rides
		// that are affected by the new data.

		const callbackWindowsMap = new Map<string, EventRideOpportunity>();

		for (const item of data) {
			if (!item.trip_id) continue;

			const standardWindowInterval = Dates
				.fromUnixMilliseconds(item.created_at)
				.std_window;

			const windowStart = standardWindowInterval.start;
			const windowEnd = standardWindowInterval.end;

			const minOperationalDate = Dates.fromUnixMilliseconds(windowStart).operational_date_int;
			const maxOperationalDate = Dates.fromUnixMilliseconds(windowEnd).operational_date_int;
			const operationalDateRange = OperationalDateIntSchema.array().parse(Array.from({ length: maxOperationalDate - minOperationalDate + 1 }, (_, i) => minOperationalDate + i));

			const window: EventRideOpportunity = {
				agency_id: item.agency_id,
				generated_at: Dates.now('utc').unix_milliseconds,
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

		const callbackWindows: EventRideOpportunity[] = [...callbackWindowsMap.values()];

		if (!callbackWindows.length) return;

		//
		// Insert values into ClickHouse.
		await labDb.operation.eventRideOpportunities.insert('JSONEachRow', callbackWindows);

		Logger.info({
			message: `Queued ${callbackWindows.length} Ride processing windows (${timer.get()})`,
		});

		//
	} catch (error) {
		Logger.error({
			error,
			message: `Error in setRidesAsWaiting: ${error?.message ?? 'Unknown error'}`,
		});
	}
};
