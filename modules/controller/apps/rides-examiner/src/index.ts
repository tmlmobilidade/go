/* * */

import { analyzeRide } from '@/utils/analyze-ride.js';
import { augmentRide } from '@/utils/augment-ride.js';
import { Dates } from '@tmlmobilidade/dates';
import { hashedShapes, hashedTrips, rides, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, simplifiedVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { UpdateRideSchema } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

export async function validateRides() {
	try {
		//

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

		Logger.info(`Processing ${ridesBatch.length} rides... (coordinator: ${fetchCoordinatorTimerResult} | interface: ${fetchRideDocumentsTimer.get()})`, 1);

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

				const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

				const hashedShapePromise = hashedShapes.findById(rideData.hashed_shape_id);
				const hashedTripPromise = hashedTrips.findById(rideData.hashed_trip_id);
				const simplifiedApexLocationsPromise = simplifiedApexLocations.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
				const simplifiedApexOnBoardRefundsPromise = simplifiedApexOnBoardRefunds.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
				const simplifiedApexOnBoardSalesPromise = simplifiedApexOnBoardSales.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
				const simplifiedApexValidationsPromise = simplifiedApexValidations.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
				const vehicleEventsPromise = simplifiedVehicleEvents.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, extra_trip_id: null, trip_id: rideData.trip_id });

				const [
					hashedShapeData,
					hashedTripData,
					simplifiedApexLocationsData,
					simplifiedApexOnBoardRefundsData,
					simplifiedApexOnBoardSalesData,
					simplifiedApexValidationsData,
					vehicleEventsData,
				] = await Promise.all([
					hashedShapePromise,
					hashedTripPromise,
					simplifiedApexLocationsPromise,
					simplifiedApexOnBoardRefundsPromise,
					simplifiedApexOnBoardSalesPromise,
					simplifiedApexValidationsPromise,
					vehicleEventsPromise,
				]);

				const fetchAnalysisDataTime = fetchAnalysisDataTimer.get();

				//
				// Augment the current Ride with additional information retrieved
				// from the fetched dynamic data. Some of this data will be used by the analyzers.

				const augmentedRideData = augmentRide({
					hashed_shape: hashedShapeData,
					hashed_trip: hashedTripData,
					ride: rideData,
					simplified_apex_locations: simplifiedApexLocationsData,
					simplified_apex_on_board_refunds: simplifiedApexOnBoardRefundsData,
					simplified_apex_on_board_sales: simplifiedApexOnBoardSalesData,
					simplified_apex_validations: simplifiedApexValidationsData,
					vehicle_events: vehicleEventsData,
				});

				//
				// Run the analyzers and count how many passed,
				// how many failed and how many errored.

				augmentedRideData.analysis = analyzeRide({
					hashed_shape: hashedShapeData,
					hashed_trip: hashedTripData,
					ride: augmentedRideData,
					simplified_apex_locations: simplifiedApexLocationsData,
					simplified_apex_on_board_refunds: simplifiedApexOnBoardRefundsData,
					simplified_apex_on_board_sales: simplifiedApexOnBoardSalesData,
					simplified_apex_validations: simplifiedApexValidationsData,
					vehicle_events: vehicleEventsData,
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

				Logger.info([
					'[', { a: 'right', c: 7, t: `${ridesBatch.length - rideIndex}/${ridesBatch.length}` }, ']',
					' F: ', { c: 5, t: fetchAnalysisDataTime },
					' T: ', { c: 7, t: rideAnalysisTimer.get() },
					{ c: 50, t: rideData._id },
					{ c: 10, t: `SKIP: ${skipAnalysisCount.length} ` },
					{ c: 10, t: `PASS: ${passAnalysisCount.length} ` },
					{ c: 10, t: `FAIL: ${failAnalysisCount.length} ` },
					{ c: 12, t: `ERROR: ${errorAnalysisCount.length} [${errorAnalysisCount.join('|')}]` },
				]);

				//
			} catch (error) {
				await rides.updateById(rideData._id, { system_status: 'error' });
				Logger.error('An error occurred while processing a ride.', error);
			}
		}

		//

		void fetch('https://status.carrismetropolitana.pt/api/push/B52rdR5Luo30Y1RAtCpHDrn4MF7vXCZb');

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		Logger.error('An error occurred. Halting execution.', err);
		Logger.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}

	//
};

/* * */

await runOnInterval(validateRides, { intervalMs: 1_000 }); // Run every 1 second
