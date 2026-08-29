/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type SimplifiedApexBankingTap, type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { performInChunks } from '@tmlmobilidade/go-utils-exec';
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

export interface RidesCallbackWindow {
	agency_id: string
	trip_id: string
	window_end: number
	window_start: number
}

/**
 * Callback function to set Rides as 'waiting' based on new AnySimplifiedApexDocument data.
 * This function identifies all Rides that are affected by the new data and marks them as 'waiting',
 * which will trigger the necessary reprocessing in the system.
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
		// Build out the query to find all Rides
		// that are affected by the new data.

		const callbackWindowsMap = new Map<string, RidesCallbackWindow>();

		for (const item of data) {
			if (!item.trip_id) continue;
			const standardWindowInterval = Dates
				.fromUnixMilliseconds(item.created_at)
				.std_window;
			const window: RidesCallbackWindow = {
				agency_id: item.agency_id,
				trip_id: item.trip_id,
				window_end: standardWindowInterval.end,
				window_start: standardWindowInterval.start,
			};
			callbackWindowsMap.set(`${window.agency_id}|${window.trip_id}|${window.window_start}|${window.window_end}`, window);
		}

		const callbackWindows: RidesCallbackWindow[] = [...callbackWindowsMap.values()];

		if (!callbackWindows.length) return;

		//
		// Perform the operation in chunks to avoid hitting Clickhouse limits.

		await performInChunks(callbackWindows, async (chunk) => {
			//

			//
			// Get the native Clickhouse client.

			const clickhouseClient = await labDb.getClient();

			//
			// Build the ClickHouse query.

			const query = `
				WITH
					arrayJoin(
						arrayZip(
							{agency_ids:Array(String)},
							{trip_ids:Array(String)},
							{window_starts:Array(Int64)},
							{window_ends:Array(Int64)}
						)
					) AS window
				SELECT *
				FROM operation.rides
				WHERE
					agency_id = window.1
					AND trip_id = window.2
					AND start_time_scheduled >= window.3
					AND start_time_scheduled <= window.4
				ORDER BY updated_at DESC
				LIMIT 1 BY _id
			`;

			const queryResult = await clickhouseClient.query({
				format: 'JSONEachRow',
				query,
				query_params: {
					agency_ids: chunk.map(window => window.agency_id),
					trip_ids: chunk.map(window => window.trip_id),
					window_ends: chunk.map(window => window.window_end),
					window_starts: chunk.map(window => window.window_start),
				},
			});

			const matchingRides = await queryResult.json<Ride>();

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
		}, 3_000); // The chunk size

		//
	} catch (error) {
		Logger.error({ error, message: `Error in setRidesAsWaiting: ${error?.message ?? 'Unknown error'}` });
	}
};
