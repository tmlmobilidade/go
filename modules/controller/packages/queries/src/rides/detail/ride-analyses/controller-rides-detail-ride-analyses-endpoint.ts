/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type ControllerRidesDetailRideAnalysesItem, ControllerRidesDetailRideAnalysesItemSchema } from './controller-rides-detail-ride-analyses-item.js';

/* * */

export async function getControllerRidesDetailRideAnalyses(rideId: string): Promise<ControllerRidesDetailRideAnalysesItem> {
	//

	//
	// Build query parameters

	const params: Record<string, number | string> = {
		1: rideId,
	};

	const whereClause = 'ride_id = $1 ORDER BY updated_at DESC LIMIT 1 BY ride_id';

	//
	// Execute the query

	const [
		atLeastOneVehicleEventOnFirstStopResult,
		atLeastOneVehicleEventOnLastStopResult,
		expectedApexValidationIntervalResult,
		expectedDriverIdQtyResult,
		expectedStartTimeResult,
		expectedVehicleEventDelayResult,
		expectedVehicleEventIntervalResult,
		expectedVehicleEventQtyResult,
		expectedVehicleIdQtyResult,
		matchingApexLocationsResult,
		matchingVehicleIdsResult,
		simpleOneApexValidationResult,
		simpleOneVehicleEventOrApexValidationResult,
		simpleThreeVehicleEventsResult,
		transactionSequentialityResult,
	] = await Promise.all([
		labDb.operation.rideAnalysisAtLeastOneVehicleEventOnFirstStop.select('*', whereClause, params),
		labDb.operation.rideAnalysisAtLeastOneVehicleEventOnLastStop.select('*', whereClause, params),
		labDb.operation.rideAnalysisExpectedApexValidationInterval.select('*', whereClause, params),
		labDb.operation.rideAnalysisExpectedDriverIdQty.select('*', whereClause, params),
		labDb.operation.rideAnalysisExpectedStartTime.select('*', whereClause, params),
		labDb.operation.rideAnalysisExpectedVehicleEventDelay.select('*', whereClause, params),
		labDb.operation.rideAnalysisExpectedVehicleEventInterval.select('*', whereClause, params),
		labDb.operation.rideAnalysisExpectedVehicleEventQty.select('*', whereClause, params),
		labDb.operation.rideAnalysisExpectedVehicleIdQty.select('*', whereClause, params),
		labDb.operation.rideAnalysisMatchingApexLocations.select('*', whereClause, params),
		labDb.operation.rideAnalysisMatchingVehicleIds.select('*', whereClause, params),
		labDb.operation.rideAnalysisSimpleOneApexValidation.select('*', whereClause, params),
		labDb.operation.rideAnalysisSimpleOneVehicleEventOrApexValidation.select('*', whereClause, params),
		labDb.operation.rideAnalysisSimpleThreeVehicleEvents.select('*', whereClause, params),
		labDb.operation.rideAnalysisTransactionSequentiality.select('*', whereClause, params),
	]);

	//
	// Return the result

	return ControllerRidesDetailRideAnalysesItemSchema.parse({
		at_least_one_vehicle_event_on_first_stop: atLeastOneVehicleEventOnFirstStopResult[0],
		at_least_one_vehicle_event_on_last_stop: atLeastOneVehicleEventOnLastStopResult[0],
		expected_apex_validation_interval: expectedApexValidationIntervalResult[0],
		expected_driver_id_qty: expectedDriverIdQtyResult[0],
		expected_start_time: expectedStartTimeResult[0],
		expected_vehicle_event_delay: expectedVehicleEventDelayResult[0],
		expected_vehicle_event_interval: expectedVehicleEventIntervalResult[0],
		expected_vehicle_event_qty: expectedVehicleEventQtyResult[0],
		expected_vehicle_id_qty: expectedVehicleIdQtyResult[0],
		matching_apex_locations: matchingApexLocationsResult[0],
		matching_vehicle_ids: matchingVehicleIdsResult[0],
		simple_one_apex_validation: simpleOneApexValidationResult[0],
		simple_one_vehicle_event_or_apex_validation: simpleOneVehicleEventOrApexValidationResult[0],
		simple_three_vehicle_events: simpleThreeVehicleEventsResult[0],
		transaction_sequentiality: transactionSequentialityResult[0],
	});
}
