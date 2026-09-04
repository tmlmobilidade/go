/* * */

import { analyzeRide } from '@/utils/analyze-ride.js';
import { augmentRide } from '@/utils/augment-ride.js';
import { fetchAnalysisData } from '@/utils/fetch-analysis-data.js';
import { insertAnalysisResults } from '@/utils/insert-analysis-results.js';
import { type RidesCoordinatorRidesResponse } from '@tmlmobilidade/go-operation-pckg-types';
import { getCoordinatorUrl, ridesProvider } from '@tmlmobilidade/go-operation-pckg-utils';
import { type Ride, type RideAnalysesRegistry } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

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

		const rideIdsBatch = await fetch(getCoordinatorUrl('rides'))
			.then(response => response.json())
			.then(data => data as RidesCoordinatorRidesResponse)
			.then(data => data.ride_ids);

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
		// Buffer Ride and RideAnalysis rows and flush once per table at the end of the batch.

		const pendingAnalyses: RideAnalysesRegistry[] = [];
		const pendingRides: Ride[] = [];

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
				// Queue the Ride and RideAnalysis rows for a single flush per table.

				pendingAnalyses.push(analyzeRideResults.analyses);
				pendingRides.push({ ...augmentedRideData, processing_status: 'complete', updated_at: Dates.now('utc').unix_milliseconds });

				//
				// Log the results

				Logger.info({ message: [
					'[', { a: 'right', c: 7, t: `${ridesBatch.length - rideIndex}/${ridesBatch.length}` }, ']',
					' FET: ', { c: 5, t: fetchAnalysisDataTime },
					' AUG: ', { c: 5, t: augmentRideTime },
					' ANA: ', { c: 5, t: analyzeRideTime },
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
		// Flush one insert per table for the whole batch.

		const insertTimer = new Timer();
		await insertAnalysisResults(pendingAnalyses, pendingRides);
		Logger.info({ message: `Inserted ${pendingRides.length} rides in ${insertTimer.get()}.`, spacesAfterOrBefore: 1 });

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
