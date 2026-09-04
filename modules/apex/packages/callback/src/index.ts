/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type SimplifiedApexBankingTap, type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type RideMatch } from '@tmlmobilidade/go-types-operation';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Common type for all SimplifiedApex documents that can be processed by the setRidesAsWaiting callback.
 * This type is a union of all the different SimplifiedApex document types that we expect to receive,
 * allowing the setRidesAsWaiting function to handle them in a generic way.
 * Do not use this type outside of the setRidesAsWaiting callback.
 */
type AnySimplifiedApexDocument =
  | SimplifiedApexBankingTap
  | SimplifiedApexLocation
  | SimplifiedApexOnBoardRefund
  | SimplifiedApexOnBoardSale
  | SimplifiedApexValidation;

/* * */

/**
 * Callback function to enqueue Ride processing windows based on new AnySimplifiedApexDocument data.
 * Downstream matching uses these windows against ride `start_time_scheduled` to mark affected Rides as 'waiting'.
 *
 * @param data An array of AnySimplifiedApexDocument documents that have been inserted or updated.
 */
export async function setRidesAsWaiting(data: AnySimplifiedApexDocument[]) {
	try {
		//

		const timer = new Timer();

		//
		// Skip if there's no data to process

		if (!data || data.length === 0) return;

		//
		// Build processing windows for all Rides
		// that are affected by the new data.

		const callbackWindowsMap = new Map<string, RideMatch>();

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

			const window: RideMatch = {
				_id: item._id,
				agency_id: item.agency_id,
				operational_dates: operationalDateRange,
				processing_status: 'waiting',
				trip_id: item.trip_id,
				updated_at: Dates.now('utc').unix_milliseconds,
				window_end: windowEnd,
				window_start: windowStart,
			};

			callbackWindowsMap.set(
				`${window.agency_id}|${window.trip_id}|${window.window_start}|${window.window_end}`,
				window,
			);
		}

		const callbackWindows: RideMatch[] = [...callbackWindowsMap.values()];

		if (!callbackWindows.length) return;

		//
		// Insert values into ClickHouse.
		await labDb.operation.rideMatches.insert('JSONEachRow', callbackWindows);

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
