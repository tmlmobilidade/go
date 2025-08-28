/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { hashedShapes, hashedTrips, rides, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, vehicleEvents } from '@tmlmobilidade/interfaces';
import { type Ride } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

import { type AnalysisData } from '@/types/analysis-data.type.js';
import { detectEndEvent } from '@/utils/detect-end-event.util.js';
import { detectFirstEvent } from '@/utils/detect-first-event.util.js';
import { detectLastEvent } from '@/utils/detect-last-event.util.js';
import { detectStartEvent } from '@/utils/detect-start-event.util.js';
import { getObservedExtension } from '@/utils/get-observed-extension.util.js';

/* * */

import { atLeastOneEventOnFirstStopAnalyzer } from '@/analyzers/at-least-one-event-on-first-stop.js';
import { atMostTwoDriverIdsAnalyzer } from '@/analyzers/at-most-two-driver-ids.analyzer.js';
import { atMostTwoVehicleIdsAnalyzer } from '@/analyzers/at-most-two-vehicle-ids.analyzer.js';
import { avgIntervalVehicleEvents } from '@/analyzers/avg-interval-vehicle-events.analyzer.js';
import { endedAtLastStopAnalyzer } from '@/analyzers/ended-at-last-stop.js';
import { excessiveVehicleEventDelayAnalyzer } from '@/analyzers/excessive-vehicle-event-delay.analyzer.js';
import { lessThanTenVehicleEventsAnalyzer } from '@/analyzers/less-than-ten-vehicle-events.analyzer.js';
import { matchingLocationTransactionsAnalyzer } from '@/analyzers/matching-location-transactions.analyzer.js';
import { ontimeStartAnalyzer } from '@/analyzers/ontime-start.analyzer.js';
import { simpleOneValidationTransactionAnalyzer } from '@/analyzers/simple-one-validation-transaction.analyzer.js';
import { simpleOneVehicleEventOrValidationTransactionAnalyzer } from '@/analyzers/simple-one-vehicle-event-or-validation-transaction.analyzer.js';
import { simpleThreeVehicleEventsAnalyzer } from '@/analyzers/simple-three-vehicle-events.analyzer.js';
import { transactionSequentialityAnalyzer } from '@/analyzers/transaction-sequentiality.analyzer.js';

/* * */

function runAnalyzers(analysisData: AnalysisData): Ride['analysis'] {
	return {

		AT_LEAST_ONE_EVENT_ON_FIRST_STOP: atLeastOneEventOnFirstStopAnalyzer(analysisData),

		AT_MOST_TWO_DRIVER_IDS: atMostTwoDriverIdsAnalyzer(analysisData),

		AT_MOST_TWO_VEHICLE_IDS: atMostTwoVehicleIdsAnalyzer(analysisData),

		AVG_INTERVAL_VEHICLE_EVENTS: avgIntervalVehicleEvents(analysisData),

		ENDED_AT_LAST_STOP: endedAtLastStopAnalyzer(analysisData),

		EXCESSIVE_VEHICLE_EVENT_DELAY: excessiveVehicleEventDelayAnalyzer(analysisData),

		LESS_THAN_TEN_VEHICLE_EVENTS: lessThanTenVehicleEventsAnalyzer(analysisData),

		MATCHING_LOCATION_TRANSACTIONS: matchingLocationTransactionsAnalyzer(analysisData),

		ONTIME_START: ontimeStartAnalyzer(analysisData),

		SIMPLE_ONE_VALIDATION_TRANSACTION: simpleOneValidationTransactionAnalyzer(analysisData),

		SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION: simpleOneVehicleEventOrValidationTransactionAnalyzer(analysisData),

		SIMPLE_THREE_VEHICLE_EVENTS: simpleThreeVehicleEventsAnalyzer(analysisData),

		TRANSACTION_SEQUENTIALITY: transactionSequentialityAnalyzer(analysisData),

	};
}

/* * */

export async function validateRides() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Ask the coordinator for a batch of Ride IDs to process

		const fetchCoordinatorTimer = new TIMETRACKER();

		const rideIdsBatchResponse = await fetch(process.env.COORDINATOR_URL + '/rides');
		const rideIdsBatch = await rideIdsBatchResponse.json() as string[];

		const fetchCoordinatorTimerResult = fetchCoordinatorTimer.get();

		//
		// With the list of Ride IDs, fetch the actual Ride documents to be processsed

		const fetchRideDocumentsTimer = new TIMETRACKER();

		const ridesBatch = await rides.findMany({ _id: { $in: rideIdsBatch || [] } });

		LOGGER.info(`Processing ${ridesBatch.length} rides... (coordinator: ${fetchCoordinatorTimerResult} | interface: ${fetchRideDocumentsTimer.get()})`, 1);

		//
		// Process each Ride

		for (const [rideIndex, rideData] of ridesBatch.entries()) {
			try {
				//

				const rideAnalysisTimer = new TIMETRACKER();

				//
				// Skip if the Ride is lockd

				if (rideData.is_locked) continue;

				//
				// For this ride, fetch all the necessary data for analysis.
				// This includes static data, like hashed shapes and trips, and dynamic data,
				// like vehicle events and apex transactions. Request all data in parallel.

				const fetchAnalysisDataTimer = new TIMETRACKER();

				const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

				const hashedShapePromise = hashedShapes.findById(rideData.hashed_shape_id);
				const hashedTripPromise = hashedTrips.findById(rideData.hashed_trip_id);
				const simplifiedApexLocationsPromise = simplifiedApexLocations.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
				const simplifiedApexOnBoardRefundsPromise = simplifiedApexOnBoardRefunds.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
				const simplifiedApexOnBoardSalesPromise = simplifiedApexOnBoardSales.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
				const simplifiedApexValidationsPromise = simplifiedApexValidations.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
				const vehicleEventsPromise = vehicleEvents.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, extra_trip_id: null, trip_id: rideData.trip_id });

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
				// Build the analysis data object to be passed to the analyzers.

				const analysisData: AnalysisData = {
					hashed_shape: hashedShapeData,
					hashed_trip: hashedTripData,
					ride: rideData,
					simplified_apex_locations: simplifiedApexLocationsData,
					simplified_apex_on_board_refunds: simplifiedApexOnBoardRefundsData,
					simplified_apex_on_board_sales: simplifiedApexOnBoardSalesData,
					simplified_apex_validations: simplifiedApexValidationsData,
					vehicle_events: vehicleEventsData,
				};

				//
				// Augment the current Ride with additional information retrieved
				// from the fetched dynamic data. Some of this data will be used by the analyzers.

				const detectedFirstEvent = detectFirstEvent(vehicleEventsData);
				const detectedLastEvent = detectLastEvent(vehicleEventsData);

				rideData.seen_first_at = detectedFirstEvent?.created_at || null;
				rideData.seen_last_at = detectedLastEvent?.created_at || null;

				const detectedStartEvent = detectStartEvent(analysisData);
				const detectedEndEvent = detectEndEvent(analysisData);

				rideData.start_time_observed = detectedStartEvent?.created_at || null;
				rideData.end_time_observed = detectedEndEvent?.created_at || null;

				rideData.extension_observed = getObservedExtension(detectedStartEvent, detectedEndEvent);

				rideData.driver_ids = Array.from(new Set(vehicleEventsData.map(item => item.driver_id).filter(Boolean)));
				rideData.vehicle_ids = Array.from(new Set(vehicleEventsData.map(item => Number(item.vehicle_id)).filter(Boolean)));

				rideData.apex_locations_qty = simplifiedApexLocationsData.length;
				rideData.apex_on_board_refunds_amount = simplifiedApexOnBoardRefundsData.reduce((acc, item) => acc + (item.price || 0), 0);
				rideData.apex_on_board_refunds_qty = simplifiedApexOnBoardRefundsData.length;
				rideData.apex_on_board_sales_amount = simplifiedApexOnBoardSalesData.reduce((acc, item) => acc + (item.price || 0), 0);
				rideData.apex_on_board_sales_qty = simplifiedApexOnBoardSalesData.length;
				rideData.apex_on_board_sales_validations_qty = simplifiedApexValidationsData.filter(item => item.category === 'on_board_sale' && item.is_passenger).length;
				rideData.apex_validations_prepaid_amount = simplifiedApexValidationsData.filter(item => item.category === 'prepaid' && item.is_passenger).reduce((acc, item) => acc + (item.units_qty || 0), 0);
				rideData.apex_validations_prepaid_qty = simplifiedApexValidationsData.filter(item => item.category === 'prepaid' && item.is_passenger).length;
				rideData.apex_validations_subscription_qty = simplifiedApexValidationsData.filter(item => item.category === 'subscription' && item.is_passenger).length;
				rideData.apex_validations_qty = simplifiedApexValidationsData.length;

				rideData.passengers_observed = simplifiedApexValidationsData.filter(item => item.is_passenger).length;

				//
				// Run the analyzers and count how many passed,
				// how many failed and how many errored.

				rideData.analysis = runAnalyzers(analysisData);

				const passAnalysisCount = Object.entries(rideData.analysis).filter(([, value]) => value.grade === 'pass').map(([key]) => key);
				const errorAnalysisCount = Object.entries(rideData.analysis).filter(([, value]) => value.grade === 'error').map(([key]) => key);
				const failAnalysisCount = Object.entries(rideData.analysis).filter(([, value]) => value.grade === 'fail').map(([key]) => key);

				//
				// Update the current Ride with the analysis result
				// and 'complete' status to indicate that the ride has been processed.

				await rides.updateById(
					rideData._id,
					{
						analysis: rideData.analysis,
						apex_locations_qty: rideData.apex_locations_qty,
						apex_on_board_refunds_amount: rideData.apex_on_board_refunds_amount,
						apex_on_board_refunds_qty: rideData.apex_on_board_refunds_qty,
						apex_on_board_sales_amount: rideData.apex_on_board_sales_amount,
						apex_on_board_sales_qty: rideData.apex_on_board_sales_qty,
						apex_validations_qty: rideData.apex_validations_qty,
						driver_ids: rideData.driver_ids,
						end_time_observed: rideData.end_time_observed,
						extension_observed: rideData.extension_observed,
						passengers_observed: rideData.passengers_observed,
						seen_first_at: rideData.seen_first_at,
						seen_last_at: rideData.seen_last_at,
						start_time_observed: rideData.start_time_observed,
						system_status: 'complete',
						vehicle_ids: rideData.vehicle_ids,
					},
				);

				LOGGER.success(`[${ridesBatch.length - rideIndex}/${ridesBatch.length}] ${rideData._id} (fetch: ${fetchAnalysisDataTime} | total: ${rideAnalysisTimer.get()}) | PASS: ${passAnalysisCount.length} | FAIL: ${failAnalysisCount.length} | ERROR: ${errorAnalysisCount.length} [${errorAnalysisCount.join('|')}]`);

				//
			}
			catch (error) {
				await rides.updateById(rideData._id, { system_status: 'error' });
				LOGGER.error('An error occurred while processing a ride.', error);
			}
		}

		//

		fetch('https://status.carrismetropolitana.pt/api/push/B52rdR5Luo30Y1RAtCpHDrn4MF7vXCZb?status=up&msg=OK&ping=');

		LOGGER.terminate(`Run took ${globalTimer.get()}.`);

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
		await validateRides();
		setTimeout(runOnInterval, 10_000); // Run every 1 second
	};
	runOnInterval();
})();
