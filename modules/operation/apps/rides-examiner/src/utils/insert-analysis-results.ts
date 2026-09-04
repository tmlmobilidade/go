/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { ridesProvider } from '@tmlmobilidade/go-operation-pckg-utils';
import { type Ride, type RideAnalysesRegistry } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

/**
 * Inserts a batch of Ride and RideAnalysis rows — one insert per table.
 * On failure, marks the buffered rides as `error`.
 */
export async function insertAnalysisResults(pendingAnalyses: RideAnalysesRegistry[], pendingRides: Ride[]): Promise<void> {
	//

	if (!pendingRides.length) return;

	try {
		await Promise.all([
			labDb.operation.rideAnalysisAtLeastOneVehicleEventOnFirstStop.insert('JSONEachRow', pendingAnalyses.map(item => item.at_least_one_vehicle_event_on_first_stop)),
			labDb.operation.rideAnalysisAtLeastOneVehicleEventOnLastStop.insert('JSONEachRow', pendingAnalyses.map(item => item.at_least_one_vehicle_event_on_last_stop)),
			labDb.operation.rideAnalysisExpectedApexValidationInterval.insert('JSONEachRow', pendingAnalyses.map(item => item.expected_apex_validation_interval)),
			labDb.operation.rideAnalysisExpectedDriverIdQty.insert('JSONEachRow', pendingAnalyses.map(item => item.expected_driver_id_qty)),
			labDb.operation.rideAnalysisExpectedStartTime.insert('JSONEachRow', pendingAnalyses.map(item => item.expected_start_time)),
			labDb.operation.rideAnalysisExpectedVehicleEventDelay.insert('JSONEachRow', pendingAnalyses.map(item => item.expected_vehicle_event_delay)),
			labDb.operation.rideAnalysisExpectedVehicleEventInterval.insert('JSONEachRow', pendingAnalyses.map(item => item.expected_vehicle_event_interval)),
			labDb.operation.rideAnalysisExpectedVehicleEventQty.insert('JSONEachRow', pendingAnalyses.map(item => item.expected_vehicle_event_qty)),
			labDb.operation.rideAnalysisExpectedVehicleIdQty.insert('JSONEachRow', pendingAnalyses.map(item => item.expected_vehicle_id_qty)),
			labDb.operation.rideAnalysisMatchingApexLocations.insert('JSONEachRow', pendingAnalyses.map(item => item.matching_apex_locations)),
			labDb.operation.rideAnalysisMatchingVehicleIds.insert('JSONEachRow', pendingAnalyses.map(item => item.matching_vehicle_ids)),
			labDb.operation.rideAnalysisSimpleOneApexValidation.insert('JSONEachRow', pendingAnalyses.map(item => item.simple_one_apex_validation)),
			labDb.operation.rideAnalysisSimpleOneVehicleEventOrApexValidation.insert('JSONEachRow', pendingAnalyses.map(item => item.simple_one_vehicle_event_or_apex_validation)),
			labDb.operation.rideAnalysisSimpleThreeVehicleEvents.insert('JSONEachRow', pendingAnalyses.map(item => item.simple_three_vehicle_events)),
			labDb.operation.rideAnalysisTransactionSequentiality.insert('JSONEachRow', pendingAnalyses.map(item => item.transaction_sequentiality)),
			labDb.operation.rides.insert('JSONEachRow', pendingRides),
		]);
	} catch (error) {
		await ridesProvider.updateRides({ _id: pendingRides.map(ride => ride._id) }, { processing_status: 'error' });
		Logger.error({ error, message: `An error occurred while inserting ride analyses: ${error.message}` });
	}

	//
};
