/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { AggregationPipeline, alerts, ChangeStreamDocument, rideAcceptances, rides } from '@tmlmobilidade/interfaces';
import { normalizeRide } from '@tmlmobilidade/sae-controller-pckg-ride-normalized';
import { Ride, RideJustificationCause } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

import { testRide } from './utils.js';

/* * */

const RUN_INTERVAL = 10_000; // 10 minutes in milliseconds

async function processRideAcceptances() {
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

		LOGGER.info(`[Rides Acceptor] Fetching rides between ${Dates.fromUnixTimestamp(startTimeScheduledMinLimit).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.DATETIME_FULL_WITH_SECONDS)} (${startTimeScheduledMinLimit}) and ${Dates.fromUnixTimestamp(startTimeScheduledMaxLimit).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.DATETIME_FULL_WITH_SECONDS)} (${startTimeScheduledMaxLimit})...`);

		const fetchTimer = new TIMETRACKER();
		const ridesBatch = await rides.aggregate(pipeline);

		LOGGER.info(`[Rides Acceptor] Found ${ridesBatch.length} rides. (${fetchTimer.get()})`);

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
			LOGGER.info(`[Rides Acceptor] Created acceptance for ride ${ride._id} with status ${allRequiredTestsArePass ? 'accepted' : 'justification_required'}.`);
		}

		//
		// Log the number of rides found.

		LOGGER.success(`[Rides Acceptor] Processed ${ridesBatch.length} rides. (${globalTimer.get()})`);
	}
	catch (error) {
		LOGGER.error('[Rides Acceptor] An error occurred. Halting execution.', error);
		LOGGER.info('[Rides Acceptor] Retrying in 10 seconds...');
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
		LOGGER.info(`[Analysis Watcher] Watching for changes in the rides collection for ${rideAcceptancesFound.length} ride acceptances...`);

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
				LOGGER.info(`[Analysis Watcher] Updated acceptance for ride ${operation.fullDocument._id} with status ${allRequiredTestsArePass ? 'accepted' : 'justification_required'}.`);
			});
	}
	catch (error) {
		LOGGER.error('[Analysis Watcher] An error occurred. Halting execution.', error);
		LOGGER.info('[Analysis Watcher] Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
}

async function realtimeAlertJustification() {
	try {
		//
		LOGGER.title(`[Realtime Alert Justification] Checking for realtime alerts to justify ride acceptances...`);

		//
		//
		const foundRideAcceptances = await rideAcceptances.findMany({ created_at: { $gte: Dates.now('Europe/Lisbon').minus({ days: 3 }).unix_timestamp }, justification: { $eq: null } });
		const foundAlerts = await alerts.findMany({
			created_at: { $gte: Dates.now('Europe/Lisbon').minus({ days: 3 }).unix_timestamp },
			type: 'REALTIME',
		});

		LOGGER.info(`[Realtime Alert Justification] Found ${foundAlerts.length} realtime alerts and ${foundRideAcceptances.length} ride acceptances.`);

		let countUpdatedRideAcceptances = 0;
		for (const alert of foundAlerts) {
			//

			//
			// If the alert is not ended or missed, skip it.
			const rideIdReferencedByAlert = alert.references.find(reference => foundRideAcceptances.some(rideAcceptance => rideAcceptance.ride_id === reference.parent_id))?.parent_id;
			if (!rideIdReferencedByAlert) continue;

			await rideAcceptances.updateByRideId(rideIdReferencedByAlert, {
				acceptance_status: 'under_review',
				justification: {
					created_at: Dates.now('Europe/Lisbon').unix_timestamp,
					created_by: alert.created_by,
					justification_cause: alert.cause as RideJustificationCause,
					justification_source: 'ALERT',
					pto_message: alert.description,
					updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
				},
			});

			countUpdatedRideAcceptances++;
		}

		LOGGER.info(`[Realtime Alert Justification] Updated ${countUpdatedRideAcceptances} ride acceptances.`);
	}
	catch (error) {
		LOGGER.error('[Realtime Alert Justification] An error occurred. Halting execution.', error);
		LOGGER.info('[Realtime Alert Justification] Retrying in 10 seconds...');
	}
}

//

(async function init() {
	//

	LOGGER.init();

	//
	// Run the main function on interval.
	const runOnInterval = async () => {
		updateAcceptanceOnAnalysis(); // Watch for changes in the rides collection.
		await processRideAcceptances();
		await realtimeAlertJustification();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
