/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Common type for all SimplifiedApex documents that can be processed by the invalidateRides callback.
 * This type is a union of all the different SimplifiedApex document types that we expect to receive,
 * allowing the invalidateRides function to handle them in a generic way.
 * Do not use this type outside of the invalidateRides callback.
 */
export type CommonSimplifiedApexDocument = SimplifiedApexLocation | SimplifiedApexOnBoardRefund | SimplifiedApexOnBoardSale | SimplifiedApexValidation;

/**
 * Callback function to invalidate Rides based on new SimplifiedApex data.
 * This function identifies all Rides that are affected by the new data and marks them as 'waiting',
 * which will trigger the necessary reprocessing in the system.
 * @param data An array of SimplifiedApex documents that have been inserted or updated.
 */
export async function invalidateRides(data: CommonSimplifiedApexDocument[]) {
	//

	// FOR NOW THIS IS DISABLED UNTIL THE OTHER PACKAGES ARE MIGRATED
	// TO READ EVENTS AND VALIDATIONS FROM GO
	return;

	//
	try {
		//

		const invalidationTimer = new Timer();

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
			.map((item: CommonSimplifiedApexDocument) => {
				const standardWindowInterval = Dates
					.fromUnixTimestamp(item.transaction_date)
					.std_window;
				return {
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

		Logger.info({ message: `Flush [simplified_apex_validations]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${invalidationTimer.get()})` });

		//
	} catch (error) {
		Logger.error({ error, message: 'Error in flushCallback' });
	}
};
