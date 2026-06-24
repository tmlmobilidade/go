/* * */

import { analyzeRide } from '@/utils/analyze-ride.js';
import { augmentRide } from '@/utils/augment-ride.js';
import { fetchAnalysisData } from '@/utils/fetch-analysis-data.js';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { UpdateRideSchema } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

export async function validateRides() {
	try {
		//

		//
		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.startNodeLogs({ app: 'rides-examiner', message: 'Sentry Rides Examiner initialized', module: 'controller', severity: 'info' });
		} catch (error) {
			Logger.error({ error, message: 'Error initializing Sentry Rides Examiner' });
		}

		//
		// Initialize the logger

		Logger.init();

		const globalTimer = new Timer();

		//
		// Ask the coordinator for a batch of Ride IDs to process

		const fetchCoordinatorTimer = new Timer();

		const rideIdsBatchResponse = await fetch(process.env.COORDINATOR_URL + '/rides');
		const rideIdsBatch = await rideIdsBatchResponse.json() as string[];

		const fetchCoordinatorTimerResult = fetchCoordinatorTimer.get();

		//
		// With the list of Ride IDs, fetch the actual Ride documents to be processsed

		const fetchRideDocumentsTimer = new Timer();

		const ridesBatch = await rides.findMany({ _id: { $in: rideIdsBatch || [] } });

		Logger.info({ message: `Processing ${ridesBatch.length} rides... (coordinator: ${fetchCoordinatorTimerResult} | interface: ${fetchRideDocumentsTimer.get()})`, spacesAfterOrBefore: 1 });

		//
		// Process each Ride

		for (const [rideIndex, rideData] of ridesBatch.entries()) {
			try {
				//

				const rideAnalysisTimer = new Timer();

				//
				// For this ride, fetch all the necessary data for analysis.
				// This includes static data, like hashed shapes and trips, and dynamic data,
				// like vehicle events and apex transactions. Request all data in parallel.

				const fetchAnalysisDataTimer = new Timer();

				const analysisData = await fetchAnalysisData(rideData);

				const fetchAnalysisDataTime = fetchAnalysisDataTimer.get();

				//
				// Augment the current Ride with additional information retrieved
				// from the fetched dynamic data. Some of this data will be used by the analyzers.

				const augmentedRideData = augmentRide({
					hashed_shape: analysisData.hashed_shape,
					hashed_trip: analysisData.hashed_trip,
					ride: rideData,
					simplified_apex_locations: analysisData.simplified_apex_locations,
					simplified_apex_on_board_refunds: analysisData.simplified_apex_on_board_refunds,
					simplified_apex_on_board_sales: analysisData.simplified_apex_on_board_sales,
					simplified_apex_validations: analysisData.simplified_apex_validations,
					vehicle_events: analysisData.vehicle_events,
				});

				//
				// Run the analyzers and count how many passed,
				// how many failed and how many errored.

				augmentedRideData.analysis = analyzeRide({
					hashed_shape: analysisData.hashed_shape,
					hashed_trip: analysisData.hashed_trip,
					ride: augmentedRideData,
					simplified_apex_locations: analysisData.simplified_apex_locations,
					simplified_apex_on_board_refunds: analysisData.simplified_apex_on_board_refunds,
					simplified_apex_on_board_sales: analysisData.simplified_apex_on_board_sales,
					simplified_apex_validations: analysisData.simplified_apex_validations,
					vehicle_events: analysisData.vehicle_events,
				});

				const skipAnalysisCount = Object.entries(augmentedRideData.analysis).filter(([, value]) => value.grade === 'skip').map(([key]) => key);
				const passAnalysisCount = Object.entries(augmentedRideData.analysis).filter(([, value]) => value.grade === 'pass').map(([key]) => key);
				const failAnalysisCount = Object.entries(augmentedRideData.analysis).filter(([, value]) => value.grade === 'fail').map(([key]) => key);
				const errorAnalysisCount = Object.entries(augmentedRideData.analysis).filter(([, value]) => value.grade === 'error').map(([key]) => key);

				//
				// Update the current Ride with the analysis result
				// and 'complete' status to indicate that the ride has been processed.

				const validatedRide = UpdateRideSchema.parse(augmentedRideData);

				await rides.updateById(rideData._id, {
					...validatedRide,
					system_status: 'complete',
				});

				Logger.info({ message: [
					'[', { a: 'right', c: 7, t: `${ridesBatch.length - rideIndex}/${ridesBatch.length}` }, ']',
					' F: ', { c: 5, t: fetchAnalysisDataTime },
					' T: ', { c: 7, t: rideAnalysisTimer.get() },
					{ c: 50, t: rideData._id },
					{ c: 10, t: `SKIP: ${skipAnalysisCount.length} ` },
					{ c: 10, t: `PASS: ${passAnalysisCount.length} ` },
					{ c: 10, t: `FAIL: ${failAnalysisCount.length} ` },
					{ c: 12, t: `ERROR: ${errorAnalysisCount.length} [${errorAnalysisCount.join('|')}]` },
				] });

				//
			} catch (error) {
				await rides.updateById(rideData._id, { system_status: 'error' });
				Logger.error({ error, message: `An error occurred while processing a ride (${rideData._id}): ${error.message}` });
			}
		}

		//

		void fetch('https://status.carrismetropolitana.pt/api/push/B52rdR5Luo30Y1RAtCpHDrn4MF7vXCZb');

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		Logger.error({ error: err, message: `An error occurred. Halting execution: ${err.message}` });
		Logger.error({ message: 'Retrying in 10 seconds...' });
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}

	//
};

/* * */

await runOnInterval(validateRides, { intervalMs: '1s' });
