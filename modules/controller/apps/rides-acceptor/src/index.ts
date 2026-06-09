/* * */

import { isEmpty, testRide } from '@/utils.js';
import { Dates } from '@tmlmobilidade/dates';
import { alerts, rideAcceptances, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { normalizeRide } from '@tmlmobilidade/normalizers';
import { Timer } from '@tmlmobilidade/timer';
import { type Ride, type RideAcceptance } from '@tmlmobilidade/types';
import { compareObjects, runOnInterval } from '@tmlmobilidade/utils';
import { Interval } from 'luxon';

/* * */

const SYNC_DAYS_BACK = 3;

async function createRideAcceptances(ride: Ride) {
	try {
		//
		// Normalize the ride.
		const normalizedRide = normalizeRide(ride);

		//
		// If the ride is not ended or missed, skip it.
		if (normalizedRide.operational_status !== 'ended' && normalizedRide.operational_status !== 'missed') return;

		//
		// Test the ride against the required tests.
		const [allRequiredTestsArePass, requiredTestsSummary] = testRide(normalizedRide.analysis);

		//
		// Create the acceptance.
		await rideAcceptances.createByRideId(ride._id, {
			acceptance_status: allRequiredTestsArePass ? 'accepted' : 'justification_required',
			analysis_summary: requiredTestsSummary,
			comments: [],
			created_by: 'system',
			is_locked: false,
			justification: null,
			ride_id: ride._id,
		}, { returnResult: false });

		Logger.info(`Created acceptance for ride ${ride._id} with status ${allRequiredTestsArePass ? 'accepted' : 'justification_required'}.`);
	} catch (err) {
		Logger.error('An error occurred. Halting execution.', err);
	}
}

async function updateRideAcceptances(ride: Ride, acceptance: RideAcceptance) {
	try {
		//
		const [allRequiredTestsArePass, requiredTestsSummary] = testRide(ride.analysis);
		const diff = compareObjects(requiredTestsSummary, acceptance.analysis_summary);

		if (isEmpty(diff)) {
			return;
		}

		await rideAcceptances.updateByRideId(ride._id, {
			acceptance_status: allRequiredTestsArePass ? 'accepted' : 'justification_required',
			analysis_summary: requiredTestsSummary,
		}, { returnResult: false });

		Logger.info(`Updated acceptance for ride ${ride._id} with status ${allRequiredTestsArePass ? 'accepted' : 'justification_required'}.`);
	} catch (err) {
		Logger.error('An error occurred. Halting execution.', err);
	}
}

async function alertJustification(ride: Ride) {
	try {
		//
		const foundAlert = await alerts.findOne({
			created_at: { $gte: Dates.now('Europe/Lisbon').minus({ days: 2 }).unix_timestamp },
			reference_type: { $in: ['rides', 'lines'] },
			references: { $elemMatch: { parent_id: { $in: [ride._id, ride.line_id] } } },
		});

		if (!foundAlert) return;

		await rideAcceptances.updateByRideId(ride._id, {
			acceptance_status: 'under_review',
			justification: {
				created_at: Dates.now('Europe/Lisbon').unix_timestamp,
				created_by: foundAlert.created_by,
				justification_cause: foundAlert.cause,
				justification_source: 'ALERT',
				pto_message: foundAlert.description,
				updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			},
		});

		Logger.info(`Justified ride ${ride._id} with alert ${foundAlert._id}.`);
	} catch (error) {
		Logger.error('An error occurred. Halting execution.', error);
		Logger.info('Retrying in 10 seconds...');
	}
}

async function main() {
	try {
		//

		//
		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.info('');
			Logger.logsNode({ app: 'rides-acceptor', message: 'Sentry Rides Acceptor initialized', module: 'controller', severity: 'info' });
		} catch {
			Logger.error('Error initializing Sentry Rides Acceptor');
		}

		Logger.init();

		const globalTimer = new Timer();
		//
		// In order to sync both collections in a manageable way, due to the high volume of data,
		// it is necessary to divide the process into smaller blocks. Instead of syncing all documents at once,
		// divide the process by timestamps chunks and iterate over each one, getting all document IDs from both databases.
		// Like this we can more easily compare the IDs in memory and sync only the missing documents.
		// More recent data is more important than older data, so we start syncing the most recent data first.
		// It makes sense to divide chunks by day, but this should be adjusted according to the volume of data in each chunk.

		const thirtySecondsAgo = Dates
			.now('Europe/Lisbon')
			.minus({ seconds: 30 });
		const earliestDataNeeded = Dates.now('Europe/Lisbon').minus({ days: SYNC_DAYS_BACK });

		const allTimestampChunks = Interval
			.fromISO(`${earliestDataNeeded.iso}/${thirtySecondsAgo.iso}`)
			.splitBy({ hour: 2 })
			.map(interval => ({ end: interval.end.toMillis(), start: interval.start.toMillis() }))
			.sort((a, b) => b.start - a.start);

		//
		// Iterate over each timestamp chunk and sync the documents.
		// Timestamp chunks are sorted in descending order, so that more recent data is processed first.
		// Timestamp chunks are in the format { start: day1, end: day2 }, so end is always greater than start.
		// This might be confusing as the array of chunks itself is sorted in descending order, but the chunks individually are not.

		const totalRides = 0;
		for (const [chunkIndex, chunkData] of allTimestampChunks.entries()) {
			//

			const chunkTimer = new Timer();
			const progress = `[${chunkIndex + 1}/${allTimestampChunks.length}]`;

			const chunkStartDate = Dates
				.fromUnixTimestamp(chunkData.start)
				.setZone('Europe/Lisbon', 'offset_only');

			const chunkEndDate = Dates
				.fromUnixTimestamp(chunkData.end)
				.setZone('Europe/Lisbon', 'offset_only');

			Logger.spacer(1);
			Logger.title(`${progress} - ${chunkEndDate.toLocaleString(Dates.FORMATS.DATETIME_MEDIUM_WITH_SECONDS)} › ${chunkStartDate.toLocaleString(Dates.FORMATS.DATETIME_MEDIUM_WITH_SECONDS)}`);

			//
			// Fetch the rides.
			const foundRides = await rides.findMany({ start_time_scheduled: { $gte: chunkStartDate.unix_timestamp, $lte: chunkEndDate.unix_timestamp } });

			//
			// Bulk fetch acceptances.
			const acceptances: RideAcceptance[] = await rideAcceptances.findMany({ ride_id: { $in: foundRides.map(r => r._id) } });
			const acceptanceMap = new Map<string, RideAcceptance>(acceptances.map(a => [a.ride_id, a]));

			//
			// Loop through the found rides and process
			let totalRides = 0;
			for (const ride of foundRides) {
				//

				totalRides++;

				//
				// If the ride does not have an acceptance, create one.
				if (!acceptanceMap.has(ride._id)) {
					await createRideAcceptances(ride);
					continue;
				}

				//
				// If the ride has an acceptance, update it.
				await updateRideAcceptances(ride, acceptanceMap.get(ride._id));

				//
				// Justify
				if (acceptanceMap.get(ride._id)?.acceptance_status === 'justification_required') {
					await alertJustification(ride);
				}
			}

			//

			Logger.info(`Found ${totalRides} rides. (${chunkTimer.get()})`);

			Logger.spacer(1);
			Logger.divider();
		}

		Logger.info(`Total rides: ${totalRides}. (${globalTimer.get()})`);
	} catch (err) {
		Logger.error('An error occurred. Halting execution.', err);
		Logger.info('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}

	//
}

//

await runOnInterval(main, { intervalMs: '10m' });
