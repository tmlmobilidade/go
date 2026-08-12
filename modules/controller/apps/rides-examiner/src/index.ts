/* * */

import { analyzeRide } from '@/utils/analyze-ride.js';
import { augmentRide } from '@/utils/augment-ride.js';
import { fetchAnalysisData } from '@/utils/fetch-analysis-data.js';
import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { ridesProvider } from '@tmlmobilidade/go-providers-operation';
import { getCurrentEnvironment } from '@tmlmobilidade/go-types-shared';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

export async function analyzeRides() {
	try {
		//

		//
		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.startNodeLogs({ app: 'rides-analyzer', message: 'Sentry Rides Examiner initialized', module: 'controller', severity: 'info' });
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
		// Skip this run if there are no rides to process

		if (!rideIdsBatch?.length) {
			Logger.info({ message: 'No rides to process. Skipping run.' });
			return;
		}

		//
		// With the list of Ride IDs, fetch the actual Ride documents to be processsed

		const fetchRideDocumentsTimer = new Timer();

		const ridesBatch = await ridesProvider.findRides({ _id: rideIdsBatch });

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

				const augmentRideTimer = new Timer();

				const augmentedRideData = augmentRide(analysisData);

				const augmentRideTime = augmentRideTimer.get();

				//
				// Run the analyzers and count how many passed,
				// how many failed and how many errored.

				const analyzeRideTimer = new Timer();

				const analyzeRideResults = analyzeRide(analysisData);

				const analyzeRideTime = analyzeRideTimer.get();

				//
				// Insert new versions of the Ride and RideAnalysis documents in parallel

				const insertTimer = new Timer();

				const nowUnixTimestamp = Dates.now('utc').unix_timestamp;

				const insertPromises = [
					labDb.operation.rideAnalysisAtLeastOneVehicleEventOnFirstStop.insert('JSONEachRow', [analyzeRideResults.analyses.atLeastOneVehicleEventOnFirstStop]),
					labDb.operation.rideAnalysisAtLeastOneVehicleEventOnLastStop.insert('JSONEachRow', [analyzeRideResults.analyses.atLeastOneVehicleEventOnLastStop]),
					labDb.operation.rideAnalysisExpectedApexValidationInterval.insert('JSONEachRow', [analyzeRideResults.analyses.expectedApexValidationInterval]),
					labDb.operation.rideAnalysisExpectedDriverIdQty.insert('JSONEachRow', [analyzeRideResults.analyses.expectedDriverIdQty]),
					labDb.operation.rideAnalysisExpectedStartTime.insert('JSONEachRow', [analyzeRideResults.analyses.expectedStartTime]),
					labDb.operation.rideAnalysisExpectedVehicleEventDelay.insert('JSONEachRow', [analyzeRideResults.analyses.expectedVehicleEventDelay]),
					labDb.operation.rideAnalysisExpectedVehicleEventInterval.insert('JSONEachRow', [analyzeRideResults.analyses.expectedVehicleEventInterval]),
					labDb.operation.rideAnalysisExpectedVehicleEventQty.insert('JSONEachRow', [analyzeRideResults.analyses.expectedVehicleEventQty]),
					labDb.operation.rideAnalysisExpectedVehicleIdQty.insert('JSONEachRow', [analyzeRideResults.analyses.expectedVehicleIdQty]),
					labDb.operation.rideAnalysisMatchingApexLocations.insert('JSONEachRow', [analyzeRideResults.analyses.matchingApexLocations]),
					labDb.operation.rideAnalysisMatchingVehicleIds.insert('JSONEachRow', [analyzeRideResults.analyses.matchingVehicleIds]),
					labDb.operation.rideAnalysisSimpleOneApexValidation.insert('JSONEachRow', [analyzeRideResults.analyses.simpleOneApexValidation]),
					labDb.operation.rideAnalysisSimpleOneVehicleEventOrApexValidation.insert('JSONEachRow', [analyzeRideResults.analyses.simpleOneVehicleEventOrApexValidation]),
					labDb.operation.rideAnalysisSimpleThreeVehicleEvents.insert('JSONEachRow', [analyzeRideResults.analyses.simpleThreeVehicleEvents]),
					labDb.operation.rideAnalysisTransactionSequentiality.insert('JSONEachRow', [analyzeRideResults.analyses.transactionSequentiality]),
					labDb.operation.rides.insert('JSONEachRow', [{ ...augmentedRideData, processing_status: 'complete', updated_at: nowUnixTimestamp }]),
				];

				await Promise.all(insertPromises);

				const insertTime = insertTimer.get();

				//
				// Log the results

				Logger.info({ message: [
					'[', { a: 'right', c: 7, t: `${ridesBatch.length - rideIndex}/${ridesBatch.length}` }, ']',
					' FET: ', { c: 5, t: fetchAnalysisDataTime },
					' AUG: ', { c: 5, t: augmentRideTime },
					' ANA: ', { c: 5, t: analyzeRideTime },
					' INS: ', { c: 5, t: insertTime },
					' TOT: ', { c: 7, t: rideAnalysisTimer.get() },
					{ c: 50, t: rideData._id },
					{ c: 10, t: `SKIP: ${analyzeRideResults.metrics.skip.length} ` },
					{ c: 10, t: `PASS: ${analyzeRideResults.metrics.pass.length} ` },
					{ c: 10, t: `FAIL: ${analyzeRideResults.metrics.fail.length} ` },
					{ c: 12, t: `ERROR: ${analyzeRideResults.metrics.error.length} [${analyzeRideResults.metrics.error.join('|')}]` },
				] });

				//
			} catch (error) {
				await ridesProvider.updateRideById(rideData._id, { processing_status: 'error' });
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

await runOnInterval(analyzeRides, { intervalMs: '10s' });
