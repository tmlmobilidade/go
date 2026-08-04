/* * */

import { analyzeRide } from '@/utils/analyze-ride.js';
import { augmentRide } from '@/utils/augment-ride.js';
import { fetchAnalysisData } from '@/utils/fetch-analysis-data.js';
import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { RideSchema } from '@tmlmobilidade/go-types-operation';
import { getCurrentEnvironment } from '@tmlmobilidade/go-types-shared';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
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

		const currentEnvironment = getCurrentEnvironment();
		let coordinatorUrl: string;
		if (currentEnvironment === 'dev') coordinatorUrl = `http://localhost:5050/rides`;
		else coordinatorUrl = `http://${currentEnvironment}-controller-coordinator.${currentEnvironment}-controller.svc.cluster.local/rides`;

		const rideIdsBatchResponse = await fetch(coordinatorUrl);
		const rideIdsBatch = await rideIdsBatchResponse.json() as string[];

		const fetchCoordinatorTimerResult = fetchCoordinatorTimer.get();

		//
		// With the list of Ride IDs, fetch the actual Ride documents to be processsed

		const fetchRideDocumentsTimer = new Timer();

		const ridesBatch = await labDb.operation.rides.select('*', '_id IN ($1)', { 1: rideIdsBatch.join(',') });

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

				const augmentedRideData = augmentRide(analysisData);

				//
				// Run the analyzers and count how many passed,
				// how many failed and how many errored.

				const analyzeRideResults = analyzeRide(analysisData);

				//
				// Update the current Ride with the analysis result
				// and 'complete' status to indicate that the ride has been processed.

				const validatedRide = RideSchema.parse({
					...augmentedRideData,
					system_status: 'complete',
					updated_at: Dates.now('utc').unix_timestamp,
				});

				await labDb.operation.rides.insert('JSONEachRow', [validatedRide]);

				Logger.info({ message: [
					'[', { a: 'right', c: 7, t: `${ridesBatch.length - rideIndex}/${ridesBatch.length}` }, ']',
					' F: ', { c: 5, t: fetchAnalysisDataTime },
					' T: ', { c: 7, t: rideAnalysisTimer.get() },
					{ c: 50, t: rideData._id },
					{ c: 10, t: `SKIP: ${analyzeRideResults.skipped.length} ` },
					{ c: 10, t: `PASS: ${analyzeRideResults.passed.length} ` },
					{ c: 10, t: `FAIL: ${analyzeRideResults.failed.length} ` },
					{ c: 12, t: `ERROR: ${analyzeRideResults.error.length} [${analyzeRideResults.error.join('|')}]` },
				] });

				//
			} catch (error) {
				await labDb.operation.rides.insert('JSONEachRow', [{ ...rideData, system_status: 'error', updated_at: Dates.now('utc').unix_timestamp }]);
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

await runOnInterval(validateRides, { intervalMs: '10s' });
