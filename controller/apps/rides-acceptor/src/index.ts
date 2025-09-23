/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { AggregationPipeline, rideAnnotations, rides } from '@tmlmobilidade/interfaces';
import { type CreateRideAnnotationDto, Ride } from '@tmlmobilidade/types';
import { Dates, generateRandomString } from '@tmlmobilidade/utils';

/* * */

async function lockRides() {
	try {
		//

		LOGGER.init();

		//
		// Fetch all Ride IDs with end date 10h before now

		const fetchTimer = new TIMETRACKER();

		const tenHoursAgo = Dates
			.now('Europe/Lisbon')
			.minus({ hours: 10 })
			.unix_timestamp;

		const pipeline: AggregationPipeline<Ride> = [];

		pipeline.push(
			{ $match: { end_time_scheduled: { $lte: tenHoursAgo }, system_status: 'complete' } },
			{ $lookup: { as: 'ride_annotation', foreignField: 'ride_id', from: 'ride_annotations', localField: '_id' } },
			{ $unwind: '$ride_annotation' },
			{ $addFields: { stop_ids: '$shape_details.path.stop_id' } },
			{ $project: { shape_details: 0 } },
			{ $sort: { start_time_scheduled: 1 } },
		);

		const matchingRides = await rides.aggregate(pipeline);

		for (const rideData of matchingRides) {
			// Check if a ride annotation already exists
			const associatedRideAnnotation = await rideAnnotations.findByRideId(rideData._id);
			if (associatedRideAnnotation) continue;

			/* * * * * * */

			// For the system to be able to consider a Ride it needs to have
			// the Ride data and the Ride needs to be analyzed, and it needs
			// the Alerts data for the given Ride, if any. The question is how
			// to make this at scale...

			/* * * * * * */

			// Create a new annotation for this ride
			const newAnnotation: CreateRideAnnotationDto = {
				_id: generateRandomString(),
				acceptance: [{
					_id: generateRandomString(),
					analysis_summary: {},
					created_at: Dates.now('Europe/Lisbon').unix_timestamp,
					created_by: null,
					mode: 'auto',
					status: 'accepted',
				}],
				is_locked: false,
				justification: null,
				overrides: {
					trip_id: null,
				},
				ride_id: rideData._id,
			};
		}

		LOGGER.terminate(`Updated ${result.modifiedCount} SAMs. (${fetchTimer.get()})`);

		//
	}
	catch (err) {
		LOGGER.error('An error occurred. Halting execution.', err);
		LOGGER.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}

	//
};

/* * */

(async function init() {
	const runOnInterval = async () => {
		await lockRides();
		setTimeout(runOnInterval, 43_200_000); // 12 hours
	};
	runOnInterval();
})();
