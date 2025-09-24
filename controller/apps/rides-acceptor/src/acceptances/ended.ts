import { AggregationPipeline, ChangeStreamDocument, rideAcceptances, rides } from '@tmlmobilidade/interfaces';
import { normalizeRide, RideNormalized } from '@tmlmobilidade/sae-controller-pckg-ride-normalized';
import { CreateRideAcceptanceDto, Ride } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

import { testRide } from '../utils.js';

export async function createEndedRidesAcceptances() {
	//

	const millisecondsFromRideStartToNow = Dates.now('Europe/Lisbon').minus({ minutes: 10 }).unix_timestamp;
	const ridesCollection = await rides.getCollection();
	const pipeline: AggregationPipeline<Ride> = [
		{
			$match: {
				'fullDocument.start_time_scheduled': { $lt: millisecondsFromRideStartToNow },
				'operationType': 'update',
				'updateDescription.updatedFields.seen_last_at': { $exists: true },
			},
		},
	];

	ridesCollection
		.watch(pipeline, { fullDocument: 'updateLookup' })
		.on('change', async (operation: ChangeStreamDocument<Ride>) => {
			//

			//
			// If the operation is not an update, return.
			if (operation.operationType !== 'update') {
				console.log(`Operation is not an update, skipping...`);
				return;
			}

			//
			// If the ride has no seen_last_at, return.
			if (!operation.fullDocument.seen_last_at) {
				console.log(`Ride "${operation.fullDocument._id}" has no seen_last_at, skipping...`);
				return;
			}

			//
			// If the ride already has an acceptance, return.
			if (await rideAcceptances.findByRideId(operation.fullDocument._id)) {
				console.log(`Ride "${operation.fullDocument._id}" already has an acceptance, skipping...`);
				return;
			}

			//
			// Normalize the ride & check the ride as ended.
			const normalizedRide: RideNormalized = normalizeRide(operation.fullDocument);
			if (normalizedRide.operational_status !== 'ended') return;

			//
			// Test the ride against the required tests.
			const [allRequiredTestsArePass, requiredTestsSummary] = testRide(normalizedRide);

			const acceptance: CreateRideAcceptanceDto = {
				acceptance_status: allRequiredTestsArePass ? 'accepted' : 'justification_required',
				analysis_summary: requiredTestsSummary,
				comments: [],
				is_locked: false,
				justification: null,
				ride_id: normalizedRide._id,
			};

			const createdAcceptance = await rideAcceptances.createByRideId(normalizedRide._id, acceptance);
			console.log('Ride Acceptance created: ', normalizedRide._id, createdAcceptance);
		});
}
