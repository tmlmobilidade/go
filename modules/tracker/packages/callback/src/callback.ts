/* * */

import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/**
 * Callback function to set Rides as 'waiting' based on new SimplifiedVehicleEvent data.
 * This function identifies all Rides that are affected by the new data and marks them as 'waiting',
 * which will trigger the necessary reprocessing in the system.
 * @param data An array of SimplifiedVehicleEvent documents that have been inserted or updated.
 */
export async function setRidesAsWaiting(data: SimplifiedVehicleEvent[]) {
	try {
		//

		console.log('Callback disabled.');
		return;

		const timer = new Timer();

		//
		// Skip if there's no data to process

		if (!data || data.length === 0) return;

		//
		// Build out the query to find all Rides
		// that are affected by the new data.

		const updateRidesOps = data
			// Filter out documents that don't have a trip_id,
			// as they can't be associated with a Ride.
			.filter(item => !!item.trip_id)
			// Map each document to a query that will match
			// Rides that are affected by the new data.
			.map((item: SimplifiedVehicleEvent) => {
				const standardWindowInterval = Dates
					.fromUnixTimestamp(item.created_at)
					.std_window;
				return {
					agency_id: item.agency_id,
					start_time_scheduled: {
						$gte: standardWindowInterval.start,
						$lte: standardWindowInterval.end,
					},
					trip_id: item.trip_id,
				};
			});

		//
		// Skip if there are no valid queries to run

		if (!updateRidesOps.length) return;

		//
		// Run the update query to mark all affected Rides as 'waiting',
		// which will trigger the necessary reprocessing in the system.

		const updateRidesResult = await rides.updateMany(
			{ $or: updateRidesOps },
			{ system_status: 'waiting' },
			{ returnResults: false },
		);

		Logger.info({ message: `Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${timer.get()})` });

		//
	} catch (error) {
		Logger.error({ error, message: `Error in setRidesAsWaiting: ${error?.message ?? 'Unknown error'}` });
	}
};
