/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { AggregationPipeline, rideAcceptances, rides } from '@tmlmobilidade/interfaces';
import { normalizeRide } from '@tmlmobilidade/sae-controller-pckg-ride-normalized';
import { Ride } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

import { testRide } from './utils.js';

/* * */

const RUN_INTERVAL = 600_000; // 10 minutes in milliseconds

async function main() {
	try {
		//

		LOGGER.init();
		const globalTimer = new TIMETRACKER();

		//
		//
		const startTimeScheduledMaxLimit = Dates.now('Europe/Lisbon').minus({ minutes: 10 }).unix_timestamp;
		const startTimeScheduledMinLimit = Dates.now('Europe/Lisbon').minus({ days: 3, minutes: 10 }).unix_timestamp;

		/**
		 * Aggregation pipeline to filter rides that are scheduled to start within a specific time range
		 * and do not have any associated acceptances.
		 */
		const pipeline: AggregationPipeline<Ride> = [
			{ $match: { start_time_scheduled: { $gte: startTimeScheduledMinLimit, $lte: startTimeScheduledMaxLimit } } },
			{ $lookup: { as: 'acceptances', foreignField: 'ride_id', from: 'ride_acceptances', localField: '_id' } },
			{ $match: { $expr: { $eq: [{ $size: '$acceptances' }, 0] } } },
		];

		//
		// Fetch the rides.

		LOGGER.info(`Fetching rides between ${Dates.fromUnixTimestamp(startTimeScheduledMinLimit).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.DATETIME_FULL_WITH_SECONDS)} (${startTimeScheduledMinLimit}) and ${Dates.fromUnixTimestamp(startTimeScheduledMaxLimit).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.DATETIME_FULL_WITH_SECONDS)} (${startTimeScheduledMaxLimit})...`);

		const fetchTimer = new TIMETRACKER();
		const ridesBatch = await rides.aggregate(pipeline);

		LOGGER.info(`Found ${ridesBatch.length} rides. (${fetchTimer.get()})`);

		for (const ride of ridesBatch) {
			//
			// Normalize the ride.
			const normalizedRide = normalizeRide(ride);

			//
			// If the ride is not ended or missed, skip it.
			if (normalizedRide.operational_status !== 'ended' && normalizedRide.operational_status !== 'missed') continue;

			//
			// Test the ride against the required tests.
			const [allRequiredTestsArePass, requiredTestsSummary] = testRide(normalizedRide);

			//
			// Create the acceptance.
			await rideAcceptances.createByRideId(ride._id, {
				acceptance_status: allRequiredTestsArePass ? 'accepted' : 'justification_required',
				analysis_summary: requiredTestsSummary,
				comments: [],
				is_locked: false,
				justification: null,
				ride_id: ride._id,
			});

			//
			// Log the ride acceptance.
			LOGGER.info(`Created acceptance for ride ${ride._id} with status ${allRequiredTestsArePass ? 'accepted' : 'justification_required'}.`);
		}

		//
		// Log the number of rides found.

		LOGGER.success(`Processed ${ridesBatch.length} rides. (${globalTimer.get()})`);
	}
	catch (error) {
		LOGGER.error('An error occurred. Halting execution.', error);
		LOGGER.info('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
}

//

(async function init() {
	const runOnInterval = async () => {
		await main();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
