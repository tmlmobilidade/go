/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { AggregationPipeline, ChangeStreamDocument, rideAcceptances, rides } from '@tmlmobilidade/interfaces';
import { normalizeRide } from '@tmlmobilidade/sae-controller-pckg-ride-normalized';
import { Ride } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

import { testRide } from './utils.js';

/* * */

const RUN_INTERVAL = 600_000; // 10 minutes in milliseconds

async function main() {
	try {
		//

		const globalTimer = new TIMETRACKER();
		LOGGER.title(`Running Acceptor [${Dates.now('Europe/Lisbon').toLocaleString(Dates.FORMATS.DATETIME_FULL_WITH_SECONDS)}]`);

		//
		//
		const startTimeScheduledMaxLimit = Dates.now('Europe/Lisbon').plus({ days: 3 }).unix_timestamp;
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
			const [allRequiredTestsArePass, requiredTestsSummary] = testRide(normalizedRide.analysis);

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

async function updateAcceptanceOnAnalysis() {
	try {
		//
		LOGGER.title(`Watching for changes in the rides collection...`);

		//
		//
		const rideAcceptancesFound = await rideAcceptances.findMany({ created_at: { $gte: Dates.now('Europe/Lisbon').minus({ days: 3 }).unix_timestamp } });
		LOGGER.info(`Watching for changes in the rides collection for ${rideAcceptancesFound.length} ride acceptances...`);

		//
		// Pipeline to listen to changes in the rides collection.
		const pipeline: AggregationPipeline<Ride> = [
			{ $match: { 'fullDocument._id': { $in: rideAcceptancesFound.map(rideAcceptance => rideAcceptance.ride_id) } } },
			{ $match: { operationType: 'update' } },
			{
				$match: {
					$expr: {
						$gt: [
							{
								$size: {
									$filter: {
										as: 'field',
										cond: { $regexMatch: { input: '$$field.k', regex: /^analysis\./ } },
										input: { $objectToArray: '$updateDescription.updatedFields' },
									},
								},
							},
							0,
						],
					},
				},
			},
		];

		const ridesCollection = await rides.getCollection();

		ridesCollection
			.watch(pipeline, { fullDocument: 'updateLookup' })
			.on('change', async (operation: ChangeStreamDocument<Ride>) => {
				//
				console.log('HERE =======> ', JSON.stringify(operation, null, 2));

				//
				// If the operation is not an update, return.
				if (operation.operationType !== 'update') {
					return;
				}

				//
				// If the updated fields do not contain any keys starting with 'analysis.', return.
				if (!Object.keys(operation.updateDescription.updatedFields).some(key => key.startsWith('analysis.'))) {
					return;
				}

				//
				// Test the ride against the required tests.
				const [allRequiredTestsArePass, requiredTestsSummary] = testRide(operation.fullDocument.analysis);

				//
				// Update the acceptance.
				await rideAcceptances.updateByRideId(operation.fullDocument._id, {
					acceptance_status: allRequiredTestsArePass ? 'accepted' : 'justification_required',
					analysis_summary: requiredTestsSummary,
				});

				//
				// Log the ride acceptance.
				LOGGER.info(`Updated acceptance for ride ${operation.fullDocument._id} with status ${allRequiredTestsArePass ? 'accepted' : 'justification_required'}.`);
			});
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
	//

	LOGGER.init();

	//
	// Run the main function on interval.
	const runOnInterval = async () => {
		updateAcceptanceOnAnalysis(); // Watch for changes in the rides collection.
		await main();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
